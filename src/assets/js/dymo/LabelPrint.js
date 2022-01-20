var dymoLabelPrint = (function () {
    return {


        printDymanic(printerName, labelTemplate, labeelFeilds) {

            debugger;

            if (printerName == "")
                throw "No LabelWriter printers found. Install LabelWriter printer";

            var labelXml = labelTemplate;
            var label = dymo.label.framework.openLabelXml(labelXml);

            // set label Feilds Values
            for (var i = 0; i < labeelFeilds.length; ++i) {
                var feild = labeelFeilds[i];
                label.setObjectText(feild.key, feild.value);
            }

            // finally print the label
            label.print(printerName);
        },

        printLabel: function () {
            try {
                // open label
                var labelXml = '<?xml version="1.0" encoding="utf-8"?>\
    <DieCutLabel Version="8.0" Units="twips">\
    <PaperOrientation>Landscape</PaperOrientation>\
    <Id>Address</Id>\
    <PaperName>30252 Address</PaperName>\
    <DrawCommands/>\
    <ObjectInfo>\
        <TextObject>\
            <Name>Text</Name>\
            <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />\
            <BackColor Alpha="0" Red="255" Green="255" Blue="255" />\
            <LinkedObjectName></LinkedObjectName>\
            <Rotation>Rotation0</Rotation>\
            <IsMirrored>False</IsMirrored>\
            <IsVariable>True</IsVariable>\
            <HorizontalAlignment>Left</HorizontalAlignment>\
            <VerticalAlignment>Middle</VerticalAlignment>\
            <TextFitMode>ShrinkToFit</TextFitMode>\
            <UseFullFontHeight>True</UseFullFontHeight>\
            <Verticalized>False</Verticalized>\
            <StyledText/>\
        </TextObject>\
        <Bounds X="332" Y="150" Width="4455" Height="1260" />\
    </ObjectInfo>\
    </DieCutLabel>';
                var label = dymo.label.framework.openLabelXml(labelXml);

                // set label text
                label.setObjectText("Text", "Text Line 1");

                // select printer to print on
                // for simplicity sake just use the first LabelWriter printer
                var printers = dymo.label.framework.getPrinters();
                if (printers.length == 0)
                    throw "No DYMO printers are installed. Install DYMO printers.";

                var printerName = "";
                for (var i = 0; i < printers.length; ++i) {
                    var printer = printers[i];
                    if (printer.printerType == "LabelWriterPrinter") {
                        printerName = printer.name;
                        break;
                    }
                }

                if (printerName == "")
                    throw "No LabelWriter printers found. Install LabelWriter printer";

                // finally print the label
                label.print(printerName);
            }
            catch (e) {
                alert(e.message || e);
            }
        },

        initializeDymoPrinter: function () {
            if (dymo.label.framework.init) {
                //dymo.label.framework.trace = true;
                dymo.label.framework.init(onload);
            }
            //else {
            //    onload();
            // }

        },

        getLabelPrinters: function () {


            debugger;
            var labelPrinters = [];

            //return dymo.label.framework.getPrinters();

            var printers = dymo.label.framework.getPrinters();
            if (printers.length == 0)
                throw "No DYMO printers are installed. Install DYMO printers.";

            //var printerName = "";
            for (var i = 0; i < printers.length; ++i) {
                //var printer = printers[i];
                if (printers[i].printerType == "LabelWriterPrinter") {
                    labelPrinters.push(printers[i]);
                    //printerName = printer.name;
                    //break;
                }
            }

            return labelPrinters;
        }
    }
})(dymoLabelPrint || {});