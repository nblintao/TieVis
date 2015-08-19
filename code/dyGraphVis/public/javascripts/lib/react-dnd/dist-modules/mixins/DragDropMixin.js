'use strict';

var DragDropActionCreators = require('../actions/DragDropActionCreators'),
    DragDropStore = require('../stores/DragDropStore'),
    HTML5 = require('../backends/HTML5'),
    EnterLeaveMonitor = require('../utils/EnterLeaveMonitor'),
    MemoizeBindMixin = require('./MemoizeBindMixin'),
    DropEffects = require('../constants/DropEffects'),
    configureDataTransfer = require('../utils/configureDataTransfer'),
    isFileDragDropEvent = require('../utils/isFileDragDropEvent'),
    bindAll = require('../utils/bindAll'),
    invariant = require('react/lib/invariant'),
    warning = require('react/lib/warning'),
    assign = require('react/lib/Object.assign'),
    defaults = require('lodash-node/modern/objects/defaults'),
    union = require('lodash-node/modern/arrays/union'),
    rest = require('lodash-node/modern/arrays/rest'),
    without = require('lodash-node/modern/arrays/without'),
    isArray = require('lodash-node/modern/objects/isArray'),
    isObject = require('lodash-node/modern/objects/isObject'),
    noop = require('lodash-node/modern/utilities/noop');

function checkValidType(component, type) {
  invariant(
    type && typeof type === 'string',
    'Expected item type to be a non-empty string. See %s',
    component.constructor.displayName
  );
}

function checkDragSourceDefined(component, type) {
  var displayName = component.constructor.displayName;

  invariant(
    component._dragSources[type],
    'There is no drag source for "%s" registered in %s. ' +
    'Have you forgotten to register it? ' +
    'See configureDragDrop in %s',
    type,
    displayName,
    displayName
  );
}

function checkDropTargetDefined(component, type) {
  var displayName = component.constructor.displayName;

  invariant(
    component._dropTargets[type],
    'There is no drop target for "%s" registered in %s. ' +
    'Have you forgotten to register it? ' +
    'See configureDragDrop in %s',
    type,
    displayName,
    displayName
  );
}

function callDragDropLifecycle(func, component) {
  if (component.constructor._legacyConfigureDragDrop) {
    return func.apply(component, rest(arguments, 2));
  }

  return func.apply(null, rest(arguments, 1));
}

var UNLIKELY_CHAR = String.fromCharCode(0xD83D, 0xDCA9),
    _refs = 0;

function hashStringArray(arr) {
  return arr.join(UNLIKELY_CHAR);
}

var DefaultDragSource = {
  canDrag:function() {
    return true;
  },

  beginDrag:function() {
    invariant(false, 'Drag source must contain a method called beginDrag. See https://github.com/gaearon/react-dnd#drag-source-api');
  },

  endDrag: noop
};

var DefaultDropTarget = {
  canDrop:function() {
    return true;
  },

  getDropEffect:function(component, allowedEffects) {
    return allowedEffects[0];
  },

  enter: noop,
  over: noop,
  leave: noop,
  acceptDrop: noop
};

var LegacyDefaultDropTarget = {
  canDrop:function() {
    return true;
  },

  getDropEffect:function(allowedEffects) {
    return allowedEffects[0];
  },

  enter: noop,
  over: noop,
  leave: noop,
  acceptDrop: noop
};

/**
 * Use this mixin to define drag sources and drop targets.
 */
var DragDropMixin = {
  mixins: [MemoizeBindMixin],

  getInitialState:function() {
    var state = {
      ownDraggedItemType: null,
      currentDropEffect: null
    };

    return assign(state, this.getStateFromDragDropStore());
  },

  getActiveDropTargetType:function() {
    var $__0=      this.state,draggedItemType=$__0.draggedItemType,draggedItem=$__0.draggedItem,ownDraggedItemType=$__0.ownDraggedItemType,
        dropTarget = this._dropTargets[draggedItemType];

    if (!dropTarget) {
      return null;
    }

    if (draggedItemType === ownDraggedItemType) {
      return null;
    }

    var $__1=    dropTarget,canDrop=$__1.canDrop;
    return callDragDropLifecycle(canDrop, this, draggedItem) ? draggedItemType : null;
  },

  isAnyDropTargetActive:function(types) {
    return types.indexOf(this.getActiveDropTargetType()) > -1;
  },

  getStateFromDragDropStore:function() {
    return {
      draggedItem: DragDropStore.getDraggedItem(),
      draggedItemType: DragDropStore.getDraggedItemType()
    };
  },

  getDragState:function(type) {
    checkValidType(this, type);
    checkDragSourceDefined(this, type);

    return {
      isDragging: this.state.ownDraggedItemType === type
    };
  },

  getDropState:function(type) {
    checkValidType(this, type);
    checkDropTargetDefined(this, type);

    var isDragging = this.getActiveDropTargetType() === type,
        isHovering = !!this.state.currentDropEffect;

    return {
      isDragging: isDragging,
      isHovering: isDragging && isHovering
    };
  },

  componentWillMount:function() {
    this._monitor = new EnterLeaveMonitor();
    this._dragSources = {};
    this._dropTargets = {};

    if (this.configureDragDrop) {
      warning(
        this.constructor._legacyConfigureDragDrop,
        '%s declares configureDragDrop as an instance method, which is deprecated and will be removed in next version. ' +
        'Move configureDragDrop to statics and change all methods inside it to accept component as first parameter instead of using "this".',
        this.constructor.displayName
      );
      this.constructor._legacyConfigureDragDrop = true;
      this.configureDragDrop(this.registerDragDropItemTypeHandlers);
    } else if (this.constructor.configureDragDrop) {
      this.constructor.configureDragDrop(this.registerDragDropItemTypeHandlers);
    } else {
      invariant(
        this.constructor.configureDragDrop,
        '%s must implement static configureDragDrop(registerType) to use DragDropMixin',
        this.constructor.displayName
      );
    }
  },

  componentDidMount:function() {
    if (_refs === 0) {
      HTML5.setup();
    }
    _refs++;

    DragDropStore.addChangeListener(this.handleDragDropStoreChange);
  },

  componentWillUnmount:function() {
    _refs--;
    if (_refs === 0) {
      HTML5.teardown();
    }

    DragDropStore.removeChangeListener(this.handleDragDropStoreChange);
  },

  registerDragDropItemTypeHandlers:function(type, handlers) {
    checkValidType(this, type);

    var $__0=     handlers,dragSource=$__0.dragSource,dropTarget=$__0.dropTarget;

    if (dragSource) {
      invariant(
        !this._dragSources[type],
        'Drag source for %s specified twice. See configureDragDrop in %s',
        type,
        this.constructor.displayName
      );

      this._dragSources[type] = defaults(dragSource, DefaultDragSource);
    }

    if (dropTarget) {
      invariant(
        !this._dropTargets[type],
        'Drop target for %s specified twice. See configureDragDrop in %s',
        type,
        this.constructor.displayName
      );

      this._dropTargets[type] = defaults(dropTarget, this.constructor._legacyConfigureDragDrop ? LegacyDefaultDropTarget : DefaultDropTarget);
    }
  },

  handleDragDropStoreChange:function() {
    if (this.isMounted()) {
      this.setState(this.getStateFromDragDropStore());
    }
  },

  dragSourceFor:function(type) {
    checkValidType(this, type);
    checkDragSourceDefined(this, type);

    return {
      draggable: true,
      onDragStart: this.memoizeBind('handleDragStart', type),
      onDragEnd: this.memoizeBind('handleDragEnd', type)
    };
  },

  handleDragStart:function(type, e) {
    var $__0=     this._dragSources[type],canDrag=$__0.canDrag,beginDrag=$__0.beginDrag;

    if (!callDragDropLifecycle(canDrag, this, e)) {
      e.preventDefault();
      return;
    }

    // Some browser-specific fixes rely on knowing
    // current dragged element and its dragend handler.
    HTML5.beginDrag(
      e.target,
      this.handleDragEnd.bind(this, type, null)
    );

    var dragOptions = callDragDropLifecycle(beginDrag, this, e),
        $__1=       dragOptions,item=$__1.item,dragPreview=$__1.dragPreview,dragAnchors=$__1.dragAnchors,effectsAllowed=$__1.effectsAllowed;

    if (!effectsAllowed) {
      // Move is a sensible default drag effect.
      // Browser shows a drag preview anyway so we usually don't want "+" icon.
      effectsAllowed = [DropEffects.MOVE];
    }

    invariant(isArray(effectsAllowed) && effectsAllowed.length > 0, 'Expected effectsAllowed to be non-empty array');
    invariant(isObject(item), 'Expected return value of beginDrag to contain "item" object');

    configureDataTransfer(this.getDOMNode(), e.nativeEvent, dragPreview, dragAnchors, effectsAllowed);
    DragDropActionCreators.startDragging(type, item, effectsAllowed);

    // Delay setting own state by a tick so `getDragState(type).isDragging`
    // doesn't return `true` yet. Otherwise browser will capture dragged state
    // as the element screenshot.

    setTimeout(function()  {
      if (this.isMounted() && DragDropStore.getDraggedItem() === item) {
        this.setState({
          ownDraggedItemType: type
        });
      }
    }.bind(this));
  },

  handleDragEnd:function(type, e) {
    HTML5.endDrag();

    var $__0=    this._dragSources[type],endDrag=$__0.endDrag,
        effect = DragDropStore.getDropEffect();

    DragDropActionCreators.endDragging();

    if (!this.isMounted()) {

      // Note: this method may be invoked even *after* component was unmounted
      // This happens if source node was removed from DOM while dragging.

      return;
    }

    this.setState({
      ownDraggedItemType: null
    });

    callDragDropLifecycle(endDrag, this, effect, e);
  },

  dropTargetFor:function() {for (var types=[],$__0=0,$__1=arguments.length;$__0<$__1;$__0++) types.push(arguments[$__0]);
    types.forEach(function(type)  {
      checkValidType(this, type);
      checkDropTargetDefined(this, type);
    }.bind(this));

    return {
      onDragEnter: this.memoizeBind('handleDragEnter', types, hashStringArray),
      onDragOver: this.memoizeBind('handleDragOver', types, hashStringArray),
      onDragLeave: this.memoizeBind('handleDragLeave', types, hashStringArray),
      onDrop: this.memoizeBind('handleDrop', types, hashStringArray)
    };
  },

  handleDragEnter:function(types, e) {
    if (!this.isAnyDropTargetActive(types)) {
      return;
    }

    if (!this._monitor.enter(e.target)) {
      return;
    }

    var $__0=     this._dropTargets[this.state.draggedItemType],enter=$__0.enter,getDropEffect=$__0.getDropEffect,
        effectsAllowed = DragDropStore.getEffectsAllowed();

    if (isFileDragDropEvent(e)) {
      // Use Copy drop effect for dragging files.
      // Because browser gives no drag preview, "+" icon is useful.
      effectsAllowed = [DropEffects.COPY];
    }

    var dropEffect = callDragDropLifecycle(getDropEffect, this, effectsAllowed);
    if (dropEffect) {
      invariant(
        effectsAllowed.indexOf(dropEffect) > -1,
        'Effect %s supplied by drop target is not one of the effects allowed by drag source: %s',
        dropEffect,
        effectsAllowed.join(', ')
      );
    }

    this.setState({
      currentDropEffect: dropEffect
    });

    callDragDropLifecycle(enter, this, this.state.draggedItem, e);
  },

  handleDragOver:function(types, e) {
    if (!this.isAnyDropTargetActive(types)) {
      return;
    }

    e.preventDefault();

    var $__0=    this._dropTargets[this.state.draggedItemType],over=$__0.over;
    callDragDropLifecycle(over, this, this.state.draggedItem, e);

    // Don't use `none` because this will prevent browser from firing `dragend`
    HTML5.dragOver(e, this.state.currentDropEffect || 'move');
  },

  handleDragLeave:function(types, e) {
    if (!this.isAnyDropTargetActive(types)) {
      return;
    }

    if (!this._monitor.leave(e.target)) {
      return;
    }

    this.setState({
      currentDropEffect: null
    });

    var $__0=    this._dropTargets[this.state.draggedItemType],leave=$__0.leave;
    callDragDropLifecycle(leave, this, this.state.draggedItem, e);
  },

  handleDrop:function(types, e) {
    if (!this.isAnyDropTargetActive(types)) {
      return;
    }

    e.preventDefault();

    var item = this.state.draggedItem,
        $__0=    this._dropTargets[this.state.draggedItemType],acceptDrop=$__0.acceptDrop,
        $__1=    this.state,currentDropEffect=$__1.currentDropEffect,
        isHandled = !!DragDropStore.getDropEffect();

    if (isFileDragDropEvent(e)) {
      // We don't know file list until the `drop` event,
      // so we couldn't put `item` into the store.
      item = {
        files: Array.prototype.slice.call(e.dataTransfer.files)
      };
    }

    this._monitor.reset();

    if (!isHandled) {
      DragDropActionCreators.recordDrop(currentDropEffect);
    }

    this.setState({
      currentDropEffect: null
    });

    callDragDropLifecycle(acceptDrop, this, item, e, isHandled, DragDropStore.getDropEffect());
  }
};

module.exports = DragDropMixin;
