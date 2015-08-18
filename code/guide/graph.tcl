#!/usr/local/bin/wish

set colors("White") FFFFFF
set colors("Black") 000000
set colors("Red") FF0000
set colors("Green") 00FF00
set colors("Blue") 0000FF

wm title . "G U I D E"
# ------------------------------  Color and interface options -----------------------------------------
frame .graphics -bd 1 -relief raised

label .graphics.idisplaylab -text "Interactive Display"
radiobutton .graphics.idisplayon -text "On" -variable idisplay -value 1
radiobutton .graphics.idisplayoff -text "Off" -variable idisplay -value 0

label .graphics.readgmllab -text "Read GML Graphics"
radiobutton .graphics.readgmlon -text "On" -variable readgml -value 1
radiobutton .graphics.readgmloff -text "Off" -variable readgml -value 0

label .graphics.bgcolorlab -text "Background Color"
label .graphics.hexlab -text "Hex"
menubutton .graphics.bgcolor -text "Default" -menu .graphics.bgcolor.menu -relief raised -width 7

set bgColorMenu [menu .graphics.bgcolor.menu ]
$bgColorMenu config -title "Background Color" -type normal
$bgColorMenu add command -label "White" -command { set bgColor $colors("White") 
.graphics.bgcolor config -text "White"}
$bgColorMenu add command -label "Black" -command { set bgColor $colors("Black") 
.graphics.bgcolor config -text "Black"}
$bgColorMenu add command -label "Red" -command { set bgColor $colors("Red") 
.graphics.bgcolor config -text "Red"}
$bgColorMenu add command -label "Green" -command { set bgColor $colors("Green") 
.graphics.bgcolor config -text "Green"}
$bgColorMenu add command -label "Blue" -command { set bgColor $colors("Blue") 
.graphics.bgcolor config -text "Blue"}
$bgColorMenu add command -label "Other..." -command {.graphics.bgcolor config -text "Other..."
set bgColor [checkLength [string range [tk_chooseColor -initialcolor "#[checkLength $bgColor "000000"]" -title "Choose color"] 1 6] $bgColor]}
entry .graphics.bgcolorhex -width 7 -textvariable bgColor -validatecommand {validateColor %P .graphics.bgcolor } -validate key -invalidcommand {set bgColor %s  
after idle {%W config -validate %v}}

label .graphics.fgcolorlab -text "Foreground Color"
label .graphics.hexlab2 -text "Hex"
menubutton .graphics.fgcolor -text "Default" -menu .graphics.fgcolor.menu -relief raised -width 7

set fgColorMenu [menu .graphics.fgcolor.menu ]
$fgColorMenu config -title "Foreground Color" -type normal
$fgColorMenu add command -label "White" -command { set fgColor $colors("White") 
.graphics.fgcolor config -text "White"}
$fgColorMenu add command -label "Black" -command { set fgColor $colors("Black") 
.graphics.fgcolor config -text "Black"}
$fgColorMenu add command -label "Red" -command { set fgColor $colors("Red") 
.graphics.fgcolor config -text "Red"}
$fgColorMenu add command -label "Green" -command { set fgColor $colors("Green") 
.graphics.fgcolor config -text "Green"}
$fgColorMenu add command -label "Blue" -command { set fgColor $colors("Blue") 
.graphics.fgcolor config -text "Blue"}
$fgColorMenu add command -label "Other..." -command {.graphics.fgcolor config -text "Other..."
set fgColor [checkLength [string range [tk_chooseColor -initialcolor "#[checkLength $fgColor "000000"]" -title "Choose color"] 1 6] $fgColor]}
entry .graphics.fgcolorhex -width 7 -textvariable fgColor -validatecommand {validateColor %P .graphics.fgcolor } -validate key -invalidcommand {set fgColor %s  
after idle {%W config -validate %v}}

label .graphics.dspeedlab -text "Display Speed"
scale .graphics.dspeed -from 0 -to 1 -orient horizontal -variable displaySpeed -sliderrelief raised  -width 10

label .graphics.dimensionlab -text "Dimension"
scale .graphics.dimension -from 2 -to 4 -orient horizontal -variable dimension -sliderrelief raised -width 10
#entry .graphics.dimension -width 3 -textvariable dimension -validatecommand {validateDimension %P} -validate key -invalidcommand {set dimension %s
#after idle {%W config -validate %v}}

grid .graphics.idisplaylab -row 0 -column 0 -sticky w
grid .graphics.idisplayon  -row 0 -column 1 -pady 1
grid .graphics.idisplayoff -row 0 -column 2 -pady 1

grid .graphics.readgmllab  -row 1 -column 0 -sticky w
grid .graphics.readgmlon   -row 1 -column 1 -pady 1
grid .graphics.readgmloff  -row 1 -column 2 -pady 1

grid .graphics.bgcolorlab  -row 2 -column 0 -sticky w
grid .graphics.bgcolor     -row 2 -column 1 -padx 4 -pady 1
grid .graphics.hexlab      -row 2 -column 2
grid .graphics.bgcolorhex  -row 2 -column 3 -padx 4

grid .graphics.fgcolorlab  -row 3 -column 0 -sticky w
grid .graphics.fgcolor     -row 3 -column 1 -padx 4 -pady 1
grid .graphics.hexlab2     -row 3 -column 2
grid .graphics.fgcolorhex  -row 3 -column 3 -padx 4

grid .graphics.dspeedlab   -row 4 -column 0 -sticky ws
grid .graphics.dspeed      -row 4 -column 1  -columnspan 2 -padx 2 -pady 1 -sticky w

grid .graphics.dimensionlab -row 5 -column 0 -sticky ws
grid .graphics.dimension   -row 5 -column 1 -pady 1 -sticky w -padx 4
#grid .graphics


proc checkLength {hexcolor defaultcolor} {
    if { [string length $hexcolor] > 0} {
	return $hexcolor
    } else  {
	return $defaultcolor
    }
}
proc validateColor {hexcolor mbutton} {
	$mbutton config -text "Other..."
    if { [string length $hexcolor] < 7} {
	return 1
    }
    return 0
}

proc validateDimension {dim} {
    if {[string length $dim] < 2 && $dim < 5} {
	return 1
    } else {
	return 0
    }
}

proc resetColors {} {
    global bgColor
    global fgColor

    set bgColor ""
    set fgColor ""
    .graphics.fgcolor config -text "Default"
    .graphics.bgcolor config -text "Default"
}
# ------------------------------- End Color and Interface Options --------------------------------------



# --------------------------------------- Graph Options ----------------------------------------------

frame .graphoptions -relief raised -bd 1

set internalgraph [frame .graphoptions.internalgraph]

label $internalgraph.typelab -text "Graph Type"
menubutton $internalgraph.type -text "Choose One" -menu $internalgraph.type.menu -relief raised -width 13

set graphmenu [menu $internalgraph.type.menu]
$graphmenu config -title "Graph Type" -type normal

$graphmenu add command -label "Cycle" -command { set graphStr cycle 
$internalgraph.type config -text "Cycle"
setLabels 1 "" ""
makeVisible false false false}

$graphmenu add command -label "Path" -command { set graphStr path 
$internalgraph.type config -text "Path"
setLabels 1 "" ""
makeVisible false false false}

$graphmenu add command -label "Tree" -command { set graphStr tree
$internalgraph.type config -text "Tree"
setLabels 0 "Depth" "Base"
makeVisible true false false}

$graphmenu add command -label "Cube" -command { set graphStr hypercube 
$internalgraph.type config -text "Cube"
setLabels 0 "Dimension" "Thickness"
makeVisible false false false}
 
$graphmenu add command -label "Torus" -command { set graphStr torus 
$internalgraph.type config -text "Torus"
setLabels 0 "Height" "Width"
makeVisible true false false}

$graphmenu add command -label "Square Mesh (degree 4)" -command { set graphStr mesh 
$internalgraph.type config -text "Square Mesh"
setLabels 0 "Height" "Thickness"
makeVisible false false false}

$graphmenu add command -label "Triangular Mesh (degree 6)" -command { set graphStr meshT
$internalgraph.type config -text "Triangular Mesh"
setLabels 0 "Height" "Thickness"
makeVisible false false false}

$graphmenu add command -label "Twisted Torus" -command { set graphStr twistedtorus 
$internalgraph.type config -text "Twisted Torus"
setLabels 0 "Height" "Width"
makeVisible true true true}

$graphmenu add command -label "Cylinder" -command { set graphStr cylinder
$internalgraph.type config -text "Cylinder"
setLabels 0 "Height" "Width"
makeVisible true false false}

$graphmenu add command -label "Moebius Band" -command { set graphStr moebius
$internalgraph.type config -text "Moebius Band"
setLabels 0 "Length" "Thickness"
makeVisible true false false}

$graphmenu add command -label "Sierpinski" -command { set graphStr sierpinski
$internalgraph.type config -text "Sierpinski"
setLabels 0 "Recursion Depth" "Dimensionality (2 or 3)"
set thickness 2
makeVisible true false false}

$graphmenu add command -label "Random" -command { set graphStr random
$internalgraph.type config -text "Random"
setLabels 0 "Height" "Width"
makeVisible true false false}

label $internalgraph.vertnumlab -text "Number of Vertices"
entry $internalgraph.vertnum -width 5 -textvariable numVertices

label $internalgraph.thicknesslab -text "Thickness"
entry $internalgraph.thickness -width 5 -textvariable thickness

label $internalgraph.twistxlab -text "Twist X"
entry $internalgraph.twistx -width 3 -textvariable twistX

label $internalgraph.twistylab -text "Twist Y"
entry $internalgraph.twisty -width 3 -textvariable twistY

grid $internalgraph.typelab     -row 0 -column 0 -sticky w
grid $internalgraph.type        -row 0 -column 1 -pady 1 -padx 6

grid $internalgraph.vertnumlab  -row 1 -column 0 -sticky w
grid $internalgraph.vertnum     -row 1 -column 1 -sticky w -pady 1 -padx 6

grid $internalgraph.thicknesslab -row 2 -column 0 -sticky w
grid $internalgraph.thickness   -row 2 -column 1 -sticky w -pady 1 -padx 6

grid $internalgraph.twistxlab   -row 3 -column 0 -sticky w
grid $internalgraph.twistx      -row 3 -column 1 -sticky w -pady 1 -padx 6

grid $internalgraph.twistylab   -row 4 -column 0 -sticky w
grid $internalgraph.twisty      -row 4 -column 1 -sticky w -pady 1 -padx 6


proc makeVisible {thick twistx twisty} {
global internalgraph
    if {$thick} {
	$internalgraph.thickness configure -state normal -fg black
	$internalgraph.thicknesslab configure -fg black
    } else {
	$internalgraph.thickness configure -state disabled -fg gray
	$internalgraph.thicknesslab configure -fg gray
    }
    if {$twistx} {
	$internalgraph.twistx configure -state normal -fg black
	$internalgraph.twistxlab configure -fg black
    } else {
	$internalgraph.twistx configure -state disabled -fg gray
	$internalgraph.twistxlab configure -fg gray
    }
    if {$twisty} {
	$internalgraph.twisty configure -state normal -fg black
	$internalgraph.twistylab configure -fg black
    } else {
	$internalgraph.twisty configure -state disabled -fg gray
	$internalgraph.twistylab configure -fg gray
    }
}

# changes the name of the labels; if default flag is set, values are reinitialized
proc setLabels {default numOfVert T} {
    global internalgraph

    if {$default == 1} {
	$internalgraph.vertnumlab configure -text "Number Of Vertices"
	$internalgraph.thicknesslab configure -text "Thickness"
    } else {
	$internalgraph.vertnumlab configure -text "$numOfVert"
	$internalgraph.thicknesslab configure -text "$T"
    }
}

set gmlgraph [frame .graphoptions.gmlgraph]

label $gmlgraph.filenamelab -text "File Name"
entry $gmlgraph.filename  -width 15 -textvariable graphStr

label $gmlgraph.breakcomplab -text "Split Components"
radiobutton $gmlgraph.breakcompon -text "On" -variable breakComponents -value 1
radiobutton $gmlgraph.breakcompoff -text "Off" -variable breakComponents -value 0

grid $gmlgraph.filenamelab  -row 0 -column 0 -sticky w
grid $gmlgraph.filename     -row 0 -column 1 -columnspan 2 -padx 18

grid $gmlgraph.breakcomplab -row 1 -column 0 -sticky w 
grid $gmlgraph.breakcompon  -row 1 -column 1 -pady 1 -padx 8
grid $gmlgraph.breakcompoff -row 1 -column 2 -pady 1 


proc resetGraphOptions {} {
    global internalgraph

    setLabels 1 "" ""
    makeVisible true true true
    $internalgraph.type config -text "Choose One"
}
# ----------------------------------- End Graph Options ---------------------------------------------


# ----------------------------------- Graph Type control ------------------------------------------
frame .graphcontrol -bd 1 -relief raised

label .formatlab -text "GRAPH FORMAT" -relief raised -bg gray50 -fg white

radiobutton .graphcontrol.internal -text "Internally Generated" -variable grFormat -value 0 -command updateLayout
radiobutton .graphcontrol.gml -text "GML File" -variable grFormat -value 1 -command updateLayout

grid .graphcontrol.internal -row 0 -column 2 -sticky w -pady 2
grid .graphcontrol.gml      -row 1 -column 2 -sticky w -pady 2

#pack .formatlab -expand yes -fill both
#pack .graphcontrol -expand yes -fill both

# -------------------------------------- End Graph Type Control ---------------------------------



# ------------------------------------- Algorithm Type Control ---------------------------------------
frame .algcontrol -relief raised -bd 1

radiobutton .algcontrol.grip -text "GRIP" -variable plotAll -value 0 -command updateLayout
radiobutton .algcontrol.fr -text "Fruchterman-Reingold" -variable plotAll -value 1 -command updateLayout

grid .algcontrol.grip -row 0 -column 2 -pady 2 -sticky w
grid .algcontrol.fr   -row 1 -column 2 -pady 2 -sticky w
# ------------------------------------ End Algorithm Type Control  -----------------------------------



# ------------------------------------ Algorithm options ------------------------------------------
frame .algorithm -relief raised -bd 1

set grip [frame .algorithm.grip]

label $grip.filtlab -text "Filtration Technique"
radiobutton $grip.misf -text "MIS" -variable randomFiltration -value 0
radiobutton $grip.rand -text "Random" -variable randomFiltration -value 1

label $grip.initvertlab -text "Number of Initial Vertices"
entry $grip.initvert -width 5 -textvariable numInitVertices -validatecommand {validateNumInitVertices %P  } -validate key -invalidcommand {set $numInitVertices %s
after idle {%W config -validate %v}}

label $grip.refinelab -text "Refinement Algorithm"
radiobutton $grip.refinemod -text "Localized FR" -variable fullFR -value 0
radiobutton $grip.refineorig -text "Original FR" -variable fullFR -value 1

label $grip.refinelevellab -text "Number of Refinement Levels"
entry $grip.refinelevels -width 3 -textvariable refinementLevels -validatecommand {validateRefinementLevels %P } -validate key -invalidcommand {set $refinementLevels %s
after idle {%W config -validate %v}}

label $grip.iroundslab -text "Number of Initial Rounds"
entry $grip.irounds -width 5 -textvariable initRounds

label $grip.froundslab -text "Number of Final Rounds"
entry $grip.frounds -width 5 -textvariable finalRounds


proc validateNumInitVertices {numInitVertices} {
    global numVertices

    if {$numInitVertices > $numVertices} {
	return 0
    } else {
	return 1
    }  
}

proc validateRefinementLevels {levels} {

    if {[string length $levels] < 3} {
	return 1
    } else {
	return 0
    }  
}


grid $grip.filtlab        -row 0 -column 0 -sticky w 
grid $grip.misf           -row 0 -column 1 -sticky w -pady 1
grid $grip.rand           -row 0 -column 2 -sticky w -pady 1

grid $grip.initvertlab    -row 1 -column 0 -sticky w
grid $grip.initvert       -row 1 -column 1 -sticky w -pady 1 -padx 4

grid $grip.refinelab      -row 2 -column 0 -sticky w     
grid $grip.refinemod      -row 2 -column 1 -sticky w -pady 1
grid $grip.refineorig     -row 2 -column 2 -sticky w -pady 1

grid $grip.refinelevellab -row 3 -column 0 -sticky w
grid $grip.refinelevels   -row 3 -column 1 -sticky w -pady 1 -padx 4

grid $grip.iroundslab     -row 4 -column 0 -sticky w
grid $grip.irounds        -row 4 -column 1 -sticky w -pady 1 -padx 4

grid $grip.froundslab     -row 5 -column 0 -sticky w
grid $grip.frounds        -row 5 -column 1 -sticky w -pady 1 -padx 4



set fr [frame .algorithm.fr]

label $fr.tempspeedlab -text "Cooling/Heating Speed (1.0-5.0)"
entry $fr.tempspeed -width 6 -textvariable coolingSpeed -validatecommand {validateCoolingSpeed %P} -validate key -invalidcommand {set $coolingSpeed %s
after idle {%W config -validate %v}}

label $fr.heratiolab -text "Init Heat to Edge Ratio (max: 2.0)"
entry $fr.heratio -width 6 -textvariable heatEdgeRatio -validatecommand {validateHeatEdgeRatio %P} -validate key -invalidcommand {set $heatEdgeRatio %s
after idle {%W config -validate %v}}


label $fr.roundslab -text "Number of  Rounds"
entry $fr.rounds -width 5 -textvariable finalRounds 



proc validateCoolingSpeed {speed} {

    if {[string length $speed] == 0} {
	return 1
    } elseif {$speed < 1.0 || $speed > 5.0} {
	return 0
    } else {
	return 1
    } 
}


proc validateHeatEdgeRatio {ratio} {

    if {$ratio > 2.0} {
	return 0
    } else {
	return 1
    }  
}

grid $fr.tempspeedlab  -row 0 -column 0 -sticky w
grid $fr.tempspeed     -row 0 -column 1  -pady 1 -padx 4

grid $fr.heratiolab    -row 1 -column 0 -sticky w
grid $fr.heratio       -row 1 -column 1 -pady 1 -padx 4

grid $fr.roundslab    -row 2 -column 0 -sticky w
grid $fr.rounds       -row 2 -column 1 -pady 1 -sticky w -padx 4

# ----------------------------------- End Algorithm Options ---------------------------------------


# ------------------------------------ Button Frame -----------------------------------------

frame .buttonframe -relief raised -bd 1

set run [button .buttonframe.run -text "Run" -width 4 -height 4 -command Run ]
button .buttonframe.reset -text "Reset" -width 4 -height 4 -command reinitialize
button .buttonframe.quit -text "Quit" -width 4 -height 4 -command exit
button .buttonframe.help -text "Help" -width 4 -height 4 -command Help

grid .buttonframe.run  -row 0 -column 0 -padx 4 -pady 10
grid .buttonframe.reset -row 1 -column 0 -padx 4 -pady 10 
grid .buttonframe.help -row 2 -column 0 -padx 4 -pady 10
grid .buttonframe.quit  -row 3 -column 0 -padx 4 -pady 10 


# ----------------------------------- End Button Frame -------------------------------------



# ------------------------------------- Output Log --------------------------------------------

frame .output
set log [text .output.log -width 70 -height 10 \
	-borderwidth 2 -relief raised -setgrid true \
	-yscrollcommand {.output.scroll set}]
scrollbar .output.scroll -command {.output.log yview}
pack .output.scroll -side right -fill y
pack .output.log -side left -fill both -expand true

# ----------------------------------- End Output Log ---------------------------------------

proc reinitialize  {} {
    global idisplay
    global readgml
    global displaySpeed
    global dimension
    global numVertices
    global thickness
    global twistX
    global twistY
    global graphStr
    global breakComponents
    global grFormat
    global randomFiltration
    global numInitVertices
    global fullFR
    global refinementLevels
    global initRounds
    global finalRounds
    global coolingSpeed
    global heatEdgeRatio
    global plotAll

    set idisplay  1
    set readgml  0
    set displaySpeed 0
    set dimension 3
    set numVertices 5
    set thickness 4
    set twistX 0
    set twistY 0
    set graphStr "cycle"
    set breakComponents 1
    set grFormat 0
    set randomFiltration 0
    set numInitVertices 4
    set fullFR 0
    set refinementLevels 1
    set initRounds 20
    set finalRounds 20
    set coolingSpeed 3.0
    set heatEdgeRatio 0.17
    set plotAll 0

    resetColors
    resetGraphOptions
    updateLayout

    update idletasks
    .algorithm configure -width [winfo reqwidth .algorithm.grip] -height [winfo reqheight .algorithm.grip]
    pack propagate .algorithm 0

    .graphoptions configure -width [winfo reqwidth .graphoptions.internalgraph] -height [winfo reqheight .graphoptions.internalgraph]
    pack propagate .graphoptions 0
}

label .graphicslab -text "DISPLAY OPTIONS" -relief raised -bg gray50 -fg white
label .optionslab -text "GRAPH OPTIONS" -relief raised -bg gray50 -fg white
label .alglab -text "ALGORITHM" -relief raised -bg gray50 -fg white

proc updateLayout {} {
    global grFormat
    global plotAll

    pack .buttonframe -side left -fill both -expand yes
    pack .output -side right -fill both -expand true

    pack .formatlab -expand yes -fill both
    pack .graphcontrol -expand yes -fill both

    pack .graphicslab -expand yes -fill both
    pack .graphics -expand yes -fill both
    pack .optionslab -expand yes -fill both

    pack .graphoptions -expand yes -fill both
    pack .alglab -expand yes -fill both
    pack .algcontrol -expand yes -fill both
    pack .algorithm -expand yes -fill both 

    if {$grFormat == 0} {
	pack forget .graphoptions.gmlgraph
	.graphics.readgmlon configure -state disabled
	.graphics.readgmloff configure -state disabled
	.graphics.readgmllab configure -fg gray
	pack .graphoptions.internalgraph 
    } else {
	pack forget .graphoptions.internalgraph
	.graphics.readgmlon configure -state normal
	.graphics.readgmloff configure -state normal
	.graphics.readgmllab configure -fg black
	pack .graphoptions.gmlgraph 
    }

    if {$plotAll == 0} {
	pack forget .algorithm.fr
	pack .algorithm.grip 
    } else {
	pack forget .algorithm.grip
	pack .algorithm.fr 
    }
}

# Run the program and arrange to read input
proc Run {} {
    global command input log run idisplay readgml bgColor fgColor displaySpeed dimension numVertices\
	    thickness twistX twistY graphStr breakComponents grFormat randomFiltration numInitVertices\
	    fullFR refinementLevels initRounds finalRounds coolingSpeed heatEdgeRatio plotAll

    set command "./main \
	    -# $numVertices -d $dimension -g $graphStr -i $numInitVertices -T $thickness\
	    -l $refinementLevels -b $breakComponents -s $displaySpeed -r $initRounds 

-R $finalRounds -1 $twistX\
	    -2 $twistY -C $readgml -S $coolingSpeed -h $heatEdgeRatio -D $idisplay"

    if {[string length $bgColor] > 0} {
	set command "$command -B $bgColor"
    }

    if {[string length $fgColor] > 0} {
	set command "$command -F $fgColor"
    }

    if {$plotAll == 1} {
	set command "$command -p"
    }


    if {$randomFiltration == 1} {
	set command "$command -?"
    }

    if {$fullFR == 1} {
	set command "$command -f"
    }

	if [catch {open "|$command |& cat"} input] {
		$log insert end $input\n
	} else {
		fileevent $input readable Log
		$log insert end $command\n
		$run config -text Stop -command Stop
	}
}

proc Help {} {
exec wish help.tcl &
}
    

# Read and log output from the program

proc Log {} {
	global input log
	if [eof $input] {
		Stop
	} else {
		gets $input line
		$log insert end $line\n
		$log see end
	}
}

# Stop the program and fix up the button

proc Stop {} {
	global input run
	catch {close $input}
	$run config -text Run -command Run
}




reinitialize 





