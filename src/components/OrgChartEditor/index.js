import React from "react";
import fromCDN from "from-cdn";
import Button from "../Button";
import { medicalWorkers } from "../../static/data";

import "./index.css";

const template = ({ photo, name, post, phone, mail }) => {
  return `
    <div class="dhx_diagram_template_a_box dhx_diagram_template_a">
      <div class="dhx_diagram_template_a__inside">
        <div class="dhx_diagram_template_a__picture" style="background-image: url(${photo});"></div>
        <div class="dhx_diagram_template_a__body">
          <div class="dhx_diagram_template_a__title">${name}</div>
          <div class="dhx_diagram_template_a__row">
            <span class="dhx_diagram_template_a__text">${post}</span>
          </div>
          <div class="dhx_diagram_template_a__row">
            <span class="dhx_diagram_template_a__icon mdi mdi-cellphone-android"></span>
            <span class="dhx_diagram_template_a__text">${phone}</span>
          </div>
          <div class="dhx_diagram_template_a__row">
            <span class="dhx_diagram_template_a__icon mdi mdi-email-outline"></span>
            <span class="dhx_diagram_template_a__text">
              <a class="dhx_diagram_template_a__link" href="mailto:${mail}" target="_blank">${mail}</a>
            </span>
          </div>
        </div>
      </div>
    </div>
  `;
};

export default function OrgChartEditor() {
  const [collapse, setCollapse] = React.useState(true);
  const diagramContainer = React.useRef();
  const editorContainer = React.useRef();
  const diagramRef = React.useRef(null);
  const editorRef = React.useRef(null);

  React.useEffect(() => {
    fromCDN([
      "https://webix.io/dev/dhtmlx/diagram/diagram_4.0/codebase/diagramWithEditor.css",
      "https://webix.io/dev/dhtmlx/diagram/diagram_4.0/codebase/diagramWithEditor.js",
    ]).then(() => {
      const diagramElement = diagramContainer.current;
      const editorElement = editorContainer.current;

      if (!diagramContainer || !editorContainer) return;

      // eslint-disable-next-line no-undef
      const diagram = new dhx.Diagram(diagramElement, {
        type: "org",
        defaultShapeType: "template",
      });
      // eslint-disable-next-line no-undef
      const editor = new dhx.DiagramEditor(editorElement, {
        type: "org",
        shapeType: "template",
      });

      diagram.addShape("template", {
        template,
        defaults: {
          height: 115,
          width: 330,
        },
      });

      editor.diagram.addShape("template", {
        template,
        defaults: {
          name: "Name and First name",
          post: "Position held",
          phone: "(405) 000-00-00",
          mail: "some@mail.com",
          photo: "../common/big_img/big-avatar-1.jpg",
          height: 115,
          width: 330,
        },
        properties: [
          { type: "position" },
          { type: "size" },
          { type: "text", label: "Name", property: "name" },
          { type: "text", label: "Post", property: "post" },
          { type: "text", label: "Phone", property: "phone" },
          { type: "text", label: "Mail", property: "mail" },
          { type: "img", label: "Photo", property: "photo" },
        ],
      });

      editor.events.on("ApplyButton", () => {
        setCollapse(true);
        diagram.data.parse(editor.serialize());
      });
      editor.events.on("ResetButton", () => {
        setCollapse(false);
      });

      diagram.data.parse(medicalWorkers);

      diagramRef.current = diagram;
      editorRef.current = editor;
    });

    return () => {
      const diagram = diagramRef.current;
      diagram && diagram.destructor();
    };
  }, []);

  function handleEdit() {
    setCollapse(false);
    const editor = editorRef.current;
    const diagram = diagramRef.current;
    editor && diagram && editor.import(diagram);
  }

  return (
    <div
      className={`dhx-container_inner dhx_sample-container__${
        collapse ? "without" : "with"
      }-editor`}
    >
      {collapse && <Button name="Edit" onClick={handleEdit} />}
      <div
        id="diagram"
        ref={diagramContainer}
        className="dhx_sample-widget"
        style={collapse ? {} : { display: "none" }}
      />
      <div
        id="editor"
        ref={editorContainer}
        className="dhx_sample-widget"
        style={collapse ? { display: "none" } : {}}
      />
    </div>
  );
}
