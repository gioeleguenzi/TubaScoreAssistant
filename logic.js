function collectRangeIssues(score, selection, lowPitchThreshold, highPitchThreshold) {
    var matches = [];

    function pushIssue(note, chord, tick, track) {
        if (note.pitch < lowPitchThreshold) {
            matches.push({
                note: note,
                chord: chord,
                originalPitch: note.pitch,
                targetPitch: note.pitch + 12,
                reason: "too-low",
                tick: tick,
                track: track
            });
        } else if (note.pitch > highPitchThreshold) {
            matches.push({
                note: note,
                chord: chord,
                originalPitch: note.pitch,
                targetPitch: note.pitch - 12,
                reason: "too-high",
                tick: tick,
                track: track
            });
        }
    }

    if (selection && selection.isRange && selection.startSegment && selection.endSegment) {
        var cursor = score.newCursor();
        cursor.rewind(Cursor.SELECTION_START);

        var endTick = selection.endSegment.tick;
        var startTrack = selection.startTrack;
        var endTrack = selection.endTrack;

        while (cursor.segment && cursor.tick < endTick) {
            for (var track = startTrack; track <= endTrack; track++) {
                var element = cursor.segment.elementAt(track);
                if (!element || element.type !== Element.CHORD) {
                    continue;
                }

                var notes = element.notes;
                for (var i = 0; i < notes.length; i++) {
                    pushIssue(notes[i], element, cursor.tick, track);
                }
            }
            cursor.next();
        }

        return matches;
    }

    if (selection && selection.elements && selection.elements.length > 0) {
        for (var idx = 0; idx < selection.elements.length; idx++) {
            var selected = selection.elements[idx];

            if (selected.type === Element.NOTE) {
                pushIssue(selected, selected.parent, -1, selected.track);
                continue;
            }

            if (selected.type === Element.CHORD) {
                var chordNotes = selected.notes;
                for (var noteIdx = 0; noteIdx < chordNotes.length; noteIdx++) {
                    pushIssue(chordNotes[noteIdx], selected, -1, selected.track);
                }
            }
        }

        return matches;
    }

    var fullCursor = score.newCursor();
    fullCursor.rewind(0);
    var totalTracks = score.ntracks;

    while (fullCursor.segment) {
        for (var fullTrack = 0; fullTrack < totalTracks; fullTrack++) {
            var fullElement = fullCursor.segment.elementAt(fullTrack);
            if (!fullElement || fullElement.type !== Element.CHORD) {
                continue;
            }

            var fullNotes = fullElement.notes;
            for (var fullIndex = 0; fullIndex < fullNotes.length; fullIndex++) {
                pushIssue(fullNotes[fullIndex], fullElement, fullCursor.tick, fullTrack);
            }
        }
        fullCursor.next();
    }

    return matches;
}

function runAssistant(score, options) {
    var result = {
        inspectedNotes: 0,
        lowNotesFound: 0,
        highNotesFound: 0,
        lowPitchThreshold: options.lowPitchThreshold,
        highPitchThreshold: options.highPitchThreshold,
        changesApplied: 0,
        octaveUpApplied: 0
    };

    if (!score) {
        return result;
    }

    var selection = score.selection;

    var issues = collectRangeIssues(score, selection, options.lowPitchThreshold, options.highPitchThreshold);
    result.inspectedNotes = issues.length;

    for (var issueIdx = 0; issueIdx < issues.length; issueIdx++) {
        if (issues[issueIdx].reason === "too-low") {
            result.lowNotesFound++;
        } else {
            result.highNotesFound++;
        }
    }

    if (issues.length > 0) {
        score.startCmd();
        try {
            for (var i = 0; i < issues.length; i++) {
                var item = issues[i];
                if (item.targetPitch < 0 || item.targetPitch > 127) {
                    continue;
                }

                var chord = item.chord;
                if (!chord || chord.type !== Element.CHORD) {
                    continue;
                }

                var alreadyPresent = false;
                var chordNotes = chord.notes;
                for (var n = 0; n < chordNotes.length; n++) {
                    if (chordNotes[n].pitch === item.targetPitch) {
                        alreadyPresent = true;
                        break;
                    }
                }
                if (alreadyPresent) {
                    continue;
                }

                var addedNote = null;
                if (typeof chord.addNote === "function") {
                    addedNote = chord.addNote(item.targetPitch);
                } else {
                    addedNote = newElement(Element.NOTE);
                    addedNote.pitch = item.targetPitch;
                    chord.add(addedNote);
                }

                if (addedNote) {
                    addedNote.pitch = item.targetPitch;
                    if (typeof item.note.tpc1 !== "undefined") {
                        addedNote.tpc1 = item.note.tpc1;
                    }
                    if (typeof item.note.tpc2 !== "undefined") {
                        addedNote.tpc2 = item.note.tpc2;
                    }
                }

                result.octaveUpApplied++;

                result.changesApplied++;
            }
        } finally {
            score.endCmd();
        }
    }

    return result;
}
