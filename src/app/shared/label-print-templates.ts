export enum LabelPrintTemplates {

    PATIENT_MAILING_LABEL = '<?xml version="1.0" encoding="utf-8"?>\
    <DieCutLabel Version="8.0" Units="twips">\
        <PaperOrientation>Landscape</PaperOrientation>\
        <Id>Address</Id>\
        <IsOutlined>false</IsOutlined>\
        <PaperName>30252 Address</PaperName>\
        <DrawCommands>\
            <RoundRectangle X="0" Y="0" Width="1581" Height="5040" Rx="270" Ry="270" />\
        </DrawCommands>\
        <ObjectInfo>\
            <TextObject>\
                <Name>patient</Name>\
                <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />\
                <BackColor Alpha="0" Red="255" Green="255" Blue="255" />\
                <LinkedObjectName />\
                <Rotation>Rotation0</Rotation>\
                <IsMirrored>False</IsMirrored>\
                <IsVariable>False</IsVariable>\
                <GroupID>-1</GroupID>\
                <IsOutlined>False</IsOutlined>\
                <HorizontalAlignment>Left</HorizontalAlignment>\
                <VerticalAlignment>Top</VerticalAlignment>\
                <TextFitMode>ShrinkToFit</TextFitMode>\
                <UseFullFontHeight>True</UseFullFontHeight>\
                <Verticalized>False</Verticalized>\
                <StyledText>\
                    <Element>\
                        <String xml:space="preserve">PATIENT NAME</String>\
                        <Attributes>\
                            <Font Family="Arial" Size="12" Bold="True" Italic="False" Underline="False" Strikeout="False" />\
                            <ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" />\
                        </Attributes>\
                    </Element>\
                </StyledText>\
            </TextObject>\
            <Bounds X="331" Y="180" Width="4454" Height="285" />\
        </ObjectInfo>\
        <ObjectInfo>\
            <TextObject>\
                <Name>address</Name>\
                <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />\
                <BackColor Alpha="0" Red="255" Green="255" Blue="255" />\
                <LinkedObjectName />\
                <Rotation>Rotation0</Rotation>\
                <IsMirrored>False</IsMirrored>\
                <IsVariable>False</IsVariable>\
                <GroupID>-1</GroupID>\
                <IsOutlined>False</IsOutlined>\
                <HorizontalAlignment>Left</HorizontalAlignment>\
                <VerticalAlignment>Top</VerticalAlignment>\
                <TextFitMode>ShrinkToFit</TextFitMode>\
                <UseFullFontHeight>True</UseFullFontHeight>\
                <Verticalized>False</Verticalized>\
                <StyledText>\
                    <Element>\
                        <String xml:space="preserve">Address</String>\
                        <Attributes>\
                            <Font Family="Arial" Size="12" Bold="False" Italic="False" Underline="False" Strikeout="False" />\
                            <ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" />\
                        </Attributes>\
                    </Element>\
                </StyledText>\
            </TextObject>\
            <Bounds X="331" Y="510" Width="4455" Height="945" />\
        </ObjectInfo>\
    </DieCutLabel>',
    PATIENT_CHART_LABEL = '<?xml version="1.0" encoding="utf-8"?>\
    <DieCutLabel Version="8.0" Units="twips">\
        <PaperOrientation>Landscape</PaperOrientation>\
        <Id>Address</Id>\
        <IsOutlined>false</IsOutlined>\
        <PaperName>30252 Address</PaperName>\
        <DrawCommands>\
            <RoundRectangle X="0" Y="0" Width="1581" Height="5040" Rx="270" Ry="270" />\
        </DrawCommands>\
        <ObjectInfo>\
            <TextObject>\
                <Name />\
                <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />\
                <BackColor Alpha="0" Red="255" Green="255" Blue="255" />\
                <LinkedObjectName />\
                <Rotation>Rotation0</Rotation>\
                <IsMirrored>False</IsMirrored>\
                <IsVariable>False</IsVariable>\
                <GroupID>-1</GroupID>\
                <IsOutlined>False</IsOutlined>\
                <HorizontalAlignment>Left</HorizontalAlignment>\
                <VerticalAlignment>Top</VerticalAlignment>\
                <TextFitMode>ShrinkToFit</TextFitMode>\
                <UseFullFontHeight>True</UseFullFontHeight>\
                <Verticalized>False</Verticalized>\
                <StyledText>\
                    <Element>\
                        <String xml:space="preserve">PID:</String>\
                        <Attributes>\
                            <Font Family="Arial" Size="11" Bold="False" Italic="False" Underline="False" Strikeout="False" />\
                            <ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" />\
                        </Attributes>\
                    </Element>\
                </StyledText>\
            </TextObject>\
            <Bounds X="331" Y="150" Width="554" Height="240" />\
        </ObjectInfo>\
        <ObjectInfo>\
            <TextObject>\
                <Name>pid</Name>\
                <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />\
                <BackColor Alpha="0" Red="255" Green="255" Blue="255" />\
                <LinkedObjectName />\
                <Rotation>Rotation0</Rotation>\
                <IsMirrored>False</IsMirrored>\
                <IsVariable>False</IsVariable>\
                <GroupID>-1</GroupID>\
                <IsOutlined>False</IsOutlined>\
                <HorizontalAlignment>Left</HorizontalAlignment>\
                <VerticalAlignment>Top</VerticalAlignment>\
                <TextFitMode>ShrinkToFit</TextFitMode>\
                <UseFullFontHeight>True</UseFullFontHeight>\
                <Verticalized>False</Verticalized>\
                <StyledText>\
                    <Element>\
                        <String xml:space="preserve">&lt;pid&gt;</String>\
                        <Attributes>\
                            <Font Family="Arial" Size="11" Bold="False" Italic="False" Underline="False" Strikeout="False" />\
                            <ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" />\
                        </Attributes>\
                    </Element>\
                </StyledText>\
            </TextObject>\
            <Bounds X="920" Y="165" Width="1680" Height="240" />\
        </ObjectInfo>\
        <ObjectInfo>\
            <TextObject>\
                <Name />\
                <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />\
                <BackColor Alpha="0" Red="255" Green="255" Blue="255" />\
                <LinkedObjectName />\
                <Rotation>Rotation0</Rotation>\
                <IsMirrored>False</IsMirrored>\
                <IsVariable>False</IsVariable>\
                <GroupID>-1</GroupID>\
                <IsOutlined>False</IsOutlined>\
                <HorizontalAlignment>Left</HorizontalAlignment>\
                <VerticalAlignment>Top</VerticalAlignment>\
                <TextFitMode>ShrinkToFit</TextFitMode>\
                <UseFullFontHeight>True</UseFullFontHeight>\
                <Verticalized>False</Verticalized>\
                <StyledText>\
                    <Element>\
                        <String xml:space="preserve">DOB:</String>\
                        <Attributes>\
                            <Font Family="Arial" Size="11" Bold="False" Italic="False" Underline="False" Strikeout="False" />\
                            <ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" />\
                        </Attributes>\
                    </Element>\
                </StyledText>\
            </TextObject>\
            <Bounds X="2900" Y="150" Width="554.999999999999" Height="240" />\
        </ObjectInfo>\
        <ObjectInfo>\
            <TextObject>\
                <Name>dob</Name>\
                <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />\
                <BackColor Alpha="0" Red="255" Green="255" Blue="255" />\
                <LinkedObjectName />\
                <Rotation>Rotation0</Rotation>\
                <IsMirrored>False</IsMirrored>\
                <IsVariable>False</IsVariable>\
                <GroupID>-1</GroupID>\
                <IsOutlined>False</IsOutlined>\
                <HorizontalAlignment>Left</HorizontalAlignment>\
                <VerticalAlignment>Top</VerticalAlignment>\
                <TextFitMode>ShrinkToFit</TextFitMode>\
                <UseFullFontHeight>True</UseFullFontHeight>\
                <Verticalized>False</Verticalized>\
                <StyledText>\
                    <Element>\
                        <String xml:space="preserve">&lt;dob&gt;</String>\
                        <Attributes>\
                            <Font Family="Arial" Size="11" Bold="False" Italic="False" Underline="False" Strikeout="False" />\
                            <ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" />\
                        </Attributes>\
                    </Element>\
                </StyledText>\
            </TextObject>\
            <Bounds X="3560" Y="150" Width="1200" Height="240" />\
        </ObjectInfo>\
        <ObjectInfo>\
            <TextObject>\
                <Name>address</Name>\
                <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />\
                <BackColor Alpha="0" Red="255" Green="255" Blue="255" />\
                <LinkedObjectName />\
                <Rotation>Rotation0</Rotation>\
                <IsMirrored>False</IsMirrored>\
                <IsVariable>False</IsVariable>\
                <GroupID>-1</GroupID>\
                <IsOutlined>False</IsOutlined>\
                <HorizontalAlignment>Left</HorizontalAlignment>\
                <VerticalAlignment>Top</VerticalAlignment>\
                <TextFitMode>ShrinkToFit</TextFitMode>\
                <UseFullFontHeight>True</UseFullFontHeight>\
                <Verticalized>False</Verticalized>\
                <StyledText>\
                    <Element>\
                        <String xml:space="preserve">Address</String>\
                        <Attributes>\
                            <Font Family="Arial" Size="11" Bold="False" Italic="False" Underline="False" Strikeout="False" />\
                            <ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" />\
                        </Attributes>\
                    </Element>\
                </StyledText>\
            </TextObject>\
            <Bounds X="331" Y="795" Width="4455" Height="660" />\
        </ObjectInfo>\
        <ObjectInfo>\
            <TextObject>\
                <Name>patient</Name>\
                <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />\
                <BackColor Alpha="0" Red="255" Green="255" Blue="255" />\
                <LinkedObjectName />\
                <Rotation>Rotation0</Rotation>\
                <IsMirrored>False</IsMirrored>\
                <IsVariable>False</IsVariable>\
                <GroupID>-1</GroupID>\
                <IsOutlined>False</IsOutlined>\
                <HorizontalAlignment>Left</HorizontalAlignment>\
                <VerticalAlignment>Top</VerticalAlignment>\
                <TextFitMode>ShrinkToFit</TextFitMode>\
                <UseFullFontHeight>True</UseFullFontHeight>\
                <Verticalized>False</Verticalized>\
                <StyledText>\
                    <Element>\
                        <String xml:space="preserve">PATIENT NAME</String>\
                        <Attributes>\
                            <Font Family="Arial" Size="12" Bold="True" Italic="False" Underline="False" Strikeout="False" />\
                            <ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" />\
                        </Attributes>\
                    </Element>\
                </StyledText>\
            </TextObject>\
            <Bounds X="331" Y="465" Width="4454" Height="285" />\
        </ObjectInfo>\
    </DieCutLabel>',
    LAB_ORDER_SPECIMENT_LABEL = '<?xml version="1.0" encoding="utf-8"?>\
    <DieCutLabel Version="8.0" Units="twips">\
        <PaperOrientation>Landscape</PaperOrientation>\
        <Id>Address</Id>\
        <IsOutlined>false</IsOutlined>\
        <PaperName>30252 Address</PaperName>\
        <DrawCommands>\
            <RoundRectangle X="0" Y="0" Width="1581" Height="5040" Rx="270" Ry="270" />\
        </DrawCommands>\
        <ObjectInfo>\
            <TextObject>\
                <Name>patient</Name>\
                <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />\
                <BackColor Alpha="0" Red="255" Green="255" Blue="255" />\
                <LinkedObjectName />\
                <Rotation>Rotation0</Rotation>\
                <IsMirrored>False</IsMirrored>\
                <IsVariable>False</IsVariable>\
                <GroupID>-1</GroupID>\
                <IsOutlined>False</IsOutlined>\
                <HorizontalAlignment>Left</HorizontalAlignment>\
                <VerticalAlignment>Top</VerticalAlignment>\
                <TextFitMode>ShrinkToFit</TextFitMode>\
                <UseFullFontHeight>True</UseFullFontHeight>\
                <Verticalized>False</Verticalized>\
                <StyledText>\
                    <Element>\
                        <String xml:space="preserve">&lt;patient&gt;</String>\
                        <Attributes>\
                            <Font Family="Arial" Size="12" Bold="True" Italic="False" Underline="False" Strikeout="False" />\
                            <ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" />\
                        </Attributes>\
                    </Element>\
                </StyledText>\
            </TextObject>\
            <Bounds X="331" Y="150" Width="4499" Height="285" />\
        </ObjectInfo>\
        <ObjectInfo>\
            <TextObject>\
                <Name>TEXT</Name>\
                <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />\
                <BackColor Alpha="0" Red="255" Green="255" Blue="255" />\
                <LinkedObjectName />\
                <Rotation>Rotation0</Rotation>\
                <IsMirrored>False</IsMirrored>\
                <IsVariable>False</IsVariable>\
                <GroupID>-1</GroupID>\
                <IsOutlined>False</IsOutlined>\
                <HorizontalAlignment>Left</HorizontalAlignment>\
                <VerticalAlignment>Top</VerticalAlignment>\
                <TextFitMode>ShrinkToFit</TextFitMode>\
                <UseFullFontHeight>True</UseFullFontHeight>\
                <Verticalized>False</Verticalized>\
                <StyledText>\
                    <Element>\
                        <String xml:space="preserve">Patient Id:</String>\
                        <Attributes>\
                            <Font Family="Arial" Size="11" Bold="False" Italic="False" Underline="False" Strikeout="False" />\
                            <ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" />\
                        </Attributes>\
                    </Element>\
                </StyledText>\
            </TextObject>\
            <Bounds X="331" Y="480" Width="1110" Height="255" />\
        </ObjectInfo>\
        <ObjectInfo>\
            <TextObject>\
                <Name>pid</Name>\
                <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />\
                <BackColor Alpha="0" Red="255" Green="255" Blue="255" />\
                <LinkedObjectName />\
                <Rotation>Rotation0</Rotation>\
                <IsMirrored>False</IsMirrored>\
                <IsVariable>False</IsVariable>\
                <GroupID>-1</GroupID>\
                <IsOutlined>False</IsOutlined>\
                <HorizontalAlignment>Left</HorizontalAlignment>\
                <VerticalAlignment>Top</VerticalAlignment>\
                <TextFitMode>ShrinkToFit</TextFitMode>\
                <UseFullFontHeight>True</UseFullFontHeight>\
                <Verticalized>False</Verticalized>\
                <StyledText>\
                    <Element>\
                        <String xml:space="preserve">&lt;pid&gt;</String>\
                        <Attributes>\
                            <Font Family="Arial" Size="11" Bold="False" Italic="False" Underline="False" Strikeout="False" />\
                            <ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" />\
                        </Attributes>\
                    </Element>\
                </StyledText>\
            </TextObject>\
            <Bounds X="1411" Y="480" Width="2670" Height="255" />\
        </ObjectInfo>\
        <ObjectInfo>\
            <TextObject>\
                <Name>TEXT_1</Name>\
                <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />\
                <BackColor Alpha="0" Red="255" Green="255" Blue="255" />\
                <LinkedObjectName />\
                <Rotation>Rotation0</Rotation>\
                <IsMirrored>False</IsMirrored>\
                <IsVariable>False</IsVariable>\
                <GroupID>-1</GroupID>\
                <IsOutlined>False</IsOutlined>\
                <HorizontalAlignment>Left</HorizontalAlignment>\
                <VerticalAlignment>Top</VerticalAlignment>\
                <TextFitMode>ShrinkToFit</TextFitMode>\
                <UseFullFontHeight>True</UseFullFontHeight>\
                <Verticalized>False</Verticalized>\
                <StyledText>\
                    <Element>\
                        <String xml:space="preserve">Req #:</String>\
                        <Attributes>\
                            <Font Family="Arial" Size="11" Bold="False" Italic="False" Underline="False" Strikeout="False" />\
                            <ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" />\
                        </Attributes>\
                    </Element>\
                </StyledText>\
            </TextObject>\
            <Bounds X="331" Y="810" Width="1110" Height="255" />\
        </ObjectInfo>\
        <ObjectInfo>\
            <TextObject>\
                <Name>order_id</Name>\
                <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />\
                <BackColor Alpha="0" Red="255" Green="255" Blue="255" />\
                <LinkedObjectName />\
                <Rotation>Rotation0</Rotation>\
                <IsMirrored>False</IsMirrored>\
                <IsVariable>False</IsVariable>\
                <GroupID>-1</GroupID>\
                <IsOutlined>False</IsOutlined>\
                <HorizontalAlignment>Left</HorizontalAlignment>\
                <VerticalAlignment>Top</VerticalAlignment>\
                <TextFitMode>ShrinkToFit</TextFitMode>\
                <UseFullFontHeight>True</UseFullFontHeight>\
                <Verticalized>False</Verticalized>\
                <StyledText>\
                    <Element>\
                        <String xml:space="preserve">&lt;order_id&gt;</String>\
                        <Attributes>\
                            <Font Family="Arial" Size="11" Bold="False" Italic="False" Underline="False" Strikeout="False" />\
                            <ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" />\
                        </Attributes>\
                    </Element>\
                </StyledText>\
            </TextObject>\
            <Bounds X="1411" Y="810" Width="2670" Height="255" />\
        </ObjectInfo>\
        <ObjectInfo>\
            <TextObject>\
                <Name>TEXT__1</Name>\
                <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />\
                <BackColor Alpha="0" Red="255" Green="255" Blue="255" />\
                <LinkedObjectName />\
                <Rotation>Rotation0</Rotation>\
                <IsMirrored>False</IsMirrored>\
                <IsVariable>False</IsVariable>\
                <GroupID>-1</GroupID>\
                <IsOutlined>False</IsOutlined>\
                <HorizontalAlignment>Left</HorizontalAlignment>\
                <VerticalAlignment>Top</VerticalAlignment>\
                <TextFitMode>ShrinkToFit</TextFitMode>\
                <UseFullFontHeight>True</UseFullFontHeight>\
                <Verticalized>False</Verticalized>\
                <StyledText>\
                    <Element>\
                        <String xml:space="preserve">Collection Date:</String>\
                        <Attributes>\
                            <Font Family="Arial" Size="11" Bold="False" Italic="False" Underline="False" Strikeout="False" />\
                            <ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" />\
                        </Attributes>\
                    </Element>\
                </StyledText>\
            </TextObject>\
            <Bounds X="331" Y="1170" Width="1590" Height="255" />\
        </ObjectInfo>\
        <ObjectInfo>\
            <TextObject>\
                <Name>collection_date</Name>\
                <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />\
                <BackColor Alpha="0" Red="255" Green="255" Blue="255" />\
                <LinkedObjectName />\
                <Rotation>Rotation0</Rotation>\
                <IsMirrored>False</IsMirrored>\
                <IsVariable>False</IsVariable>\
                <GroupID>-1</GroupID>\
                <IsOutlined>False</IsOutlined>\
                <HorizontalAlignment>Left</HorizontalAlignment>\
                <VerticalAlignment>Top</VerticalAlignment>\
                <TextFitMode>ShrinkToFit</TextFitMode>\
                <UseFullFontHeight>True</UseFullFontHeight>\
                <Verticalized>False</Verticalized>\
                <StyledText>\
                    <Element>\
                        <String xml:space="preserve">&lt;Collection Date&gt;</String>\
                        <Attributes>\
                            <Font Family="Arial" Size="11" Bold="False" Italic="False" Underline="False" Strikeout="False" />\
                            <ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" />\
                        </Attributes>\
                    </Element>\
                </StyledText>\
            </TextObject>\
            <Bounds X="2056" Y="1170" Width="2775" Height="255" />\
        </ObjectInfo>\
    </DieCutLabel>'
}