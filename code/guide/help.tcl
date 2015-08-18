#!/usr/local/bin/wish

frame .main
set win .main

frame $win.info
pack $win.info -expand yes -fill both -padx 2 -pady 2

frame $win.sep -height 2 -borderwidth 1 -relief sunken
pack $win.sep -fill x -pady 4

frame $win.controls
pack $win.controls -fill x -padx 4 -pady 4

wm title . "G U I D E Help"

set info $win.info
scrollbar $info.sbar -command "$info.text yview"
pack $info.sbar -side right -fill y
text $info.text -wrap word -yscrollcommand "$info.sbar set"
pack $info.text -side left -expand yes -fill both

set cntls $win.controls
button $cntls.close -text "Close" -command "destroy ."
pack $cntls.close -pady 4
focus $cntls.close

$info.text configure -state disabled

pack $win -fill both -expand yes


proc read_file {fileName} {
    global info

    set buffer $info.text

    $buffer configure -state normal
    
    if [catch {open "$fileName"} input] {
	$buffer insert end "Problem loading help file:\n"
	$buffer insert end $input\n
    } else {
	set contents [read $input]
	catch {close $file}

	$buffer delete 1.0 end
	$buffer insert end $contents 
    }

    $buffer configure -state disabled
}
 

read_file "help.data"

   