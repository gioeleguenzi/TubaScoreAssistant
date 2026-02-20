import QtQuick 2.9
import QtQuick.Controls 2.2
import QtQuick.Layouts 1.3
import MuseScore 3.0
import "logic.js" as Logic

MuseScore {
	id: pluginRoot
	menuPath: "Plugins.Tuba Score Assistant"
	title: "Tuba Score Assistant"
	description: "Help composers and arrangers write a readable tuba part"
	version: "1.0"
	pluginType: "dialog"
	width: 372
	height: 170

	property var options: ({
		lowPitchThreshold: 38,
		highPitchThreshold: 44
	})

	property var noteNames: ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
	property var octaveValues: ["0", "1", "2", "3", "4", "5", "6", "7", "8"]

	function applyManifestMetadata(manifest) {
		if (!manifest) {
			return;
		}

		if (manifest.name) {
			pluginRoot.title = manifest.name;
			pluginRoot.menuPath = "Plugins." + manifest.name;
		}
		if (manifest.description) {
			pluginRoot.description = manifest.description;
		}
		if (manifest.version) {
			pluginRoot.version = manifest.version;
		}
	}

	function loadManifestFromFile() {
		var request = new XMLHttpRequest();
		request.open("GET", "plugin.json", false);
		request.send();

		if (request.status !== 200 && request.status !== 0) {
			return;
		}

		try {
			var manifest = JSON.parse(request.responseText);
			applyManifestMetadata(manifest);
		} catch (e) {
		}
	}

	function midiFromSelection(noteIndex, octaveText) {
		var octave = parseInt(octaveText);
		return (octave + 1) * 12 + noteIndex;
	}

	function applyTubaDefaults() {
		highNoteNameCombo.currentIndex = 8; // G# / Ab
		highNoteOctaveCombo.currentIndex = 2;
		lowNoteNameCombo.currentIndex = 2; // D
		lowNoteOctaveCombo.currentIndex = 2;
	}

	function applyEuphoniumDefaults() {
		highNoteNameCombo.currentIndex = 4; // E
		highNoteOctaveCombo.currentIndex = 3;
		lowNoteNameCombo.currentIndex = 4; // E
		lowNoteOctaveCombo.currentIndex = 2;
	}

	function runTemplateWorkflow() {
		if (!curScore) {
			return;
		}

		options.lowPitchThreshold = midiFromSelection(lowNoteNameCombo.currentIndex, lowNoteOctaveCombo.currentText);
		options.highPitchThreshold = midiFromSelection(highNoteNameCombo.currentIndex, highNoteOctaveCombo.currentText);

		Logic.runAssistant(curScore, options);
	}

	function closePluginDialog() {
		if (typeof pluginRoot.quit === "function") {
			pluginRoot.quit();
			return;
		}

		if (typeof Qt !== "undefined" && typeof Qt.quit === "function") {
			Qt.quit();
		}
	}

	onRun: {
		loadManifestFromFile();
	}

	ColumnLayout {
		anchors.fill: parent
		anchors.leftMargin: 10
		anchors.rightMargin: 6
		anchors.topMargin: 6
		anchors.bottomMargin: 6
		spacing: 6

		RowLayout {
			spacing: 6
			Label {
				text: "Highest note:"
				Layout.preferredWidth: 92
			}
			ComboBox {
				id: highNoteNameCombo
				model: noteNames
				currentIndex: 8
				Layout.preferredWidth: 72
			}
			ComboBox {
				id: highNoteOctaveCombo
				model: octaveValues
				currentIndex: 2
				Layout.preferredWidth: 56
			}
		}

		RowLayout {
			spacing: 6
			Label {
				text: "Lowest note:"
				Layout.preferredWidth: 92
			}
			ComboBox {
				id: lowNoteNameCombo
				model: noteNames
				currentIndex: 2
				Layout.preferredWidth: 72
			}
			ComboBox {
				id: lowNoteOctaveCombo
				model: octaveValues
				currentIndex: 2
				Layout.preferredWidth: 56
			}
		}

		RowLayout {
			Layout.fillWidth: true
			spacing: 6

			Button {
				text: "Tuba (default)"
				onClicked: applyTubaDefaults()
			}

			Button {
				text: "Euphonium (default)"
				onClicked: applyEuphoniumDefaults()
			}
		}

		RowLayout {
			Layout.alignment: Qt.AlignRight
			spacing: 6

			Button {
				text: "Run"
				onClicked: runTemplateWorkflow()
			}

			Button {
				text: "Close"
				onClicked: closePluginDialog()
			}
		}
	}
}
