'use strict';

var React = require('react'),
    ItemTypes = require('./ItemTypes'),
    getEmptyImage = require('./getEmptyImage'),
    { PropTypes } = React,
    { DragDropMixin, DropEffects } = require('react-dnd');

var Box = React.createClass({
  mixins: [DragDropMixin],

  propTypes: {
    id: PropTypes.any.isRequired,
    left: PropTypes.number.isRequired,
    top: PropTypes.number.isRequired
  },

  statics: {
    configureDragDrop(registerType) {
      registerType(ItemTypes.BOX, {
        dragSource: {
          beginDrag(component, e) {
            return {
              effectAllowed: DropEffects.MOVE,
              dragPreview: getEmptyImage(),
              item: {
                id: component.props.id,
                startLeft: component.props.left,
                startTop: component.props.top,
                startPageX: e.pageX,
                startPageY: e.pageY
              }
            };
          }
        }
      });
    }
  },

  render() {
    var { isDragging } = this.getDragState(ItemTypes.BOX),
        transform = `translate3d(${this.props.left}px, ${this.props.top}px, 0)`;

    return (
      <div {...this.dragSourceFor(ItemTypes.BOX)}
           style={{
            WebkitTransform: transform,
            transform: transform,
            opacity: isDragging ? 0.8 : 1,
            position: 'absolute',
            top: 0,
            left: 0,
            border: '1px dashed gray',
            padding: '0.5rem'
           }}>
        {this.props.children}
      </div>
    );
  }
});

module.exports = Box;
