import React, { useEffect, useState, useRef } from "react";
import fromCDN from "from-cdn";
import _ from "loadsh";
// import Button from "../Button";
import Service from "../../services";

import "./index.css";

const getImageURL = (photo) => {
  const { id } = photo || {};
  if (!id) {
    return "";
  }
  return `${
    process.env.NODE_ENV === "production" ? ".." : "axelor-erp"
  }/ws/rest/com.axelor.meta.db.MetaFile/${id}/content/download`;
};

const template = ({ photo, name, post, phone, mail }) => {
  return `
    <div class="dhx_diagram_template_a_box dhx_diagram_template_a">
      <div class="dhx_diagram_template_a__inside">
        <div class="dhx_diagram_template_a__picture" style="background-image: url(${getImageURL(
          photo
        )});">
        </div>
        <div class="dhx_diagram_template_a__body">
          <div class="dhx_diagram_template_a__title">${name}</div>
          <div class="dhx_diagram_template_a__row">
            <span class="dhx_diagram_template_a__text">${post}</span>
          </div>
          <div class="dhx_diagram_template_a__row">
            <span class="dhx_diagram_template_a__icon mdi mdi-cellphone-android"></span>
            <span class="dhx_diagram_template_a__text">${phone}</span>
          </div>
          ${
            mail
              ? `<div class="dhx_diagram_template_a__row">
            <span class="dhx_diagram_template_a__icon mdi mdi-email-outline"></span>
            <span class="dhx_diagram_template_a__text">
              <a class="dhx_diagram_template_a__link" href="mailto:${mail}" target="_blank">${mail}</a>
            </span>
          </div>`
              : ""
          }
        </div>
      </div>
    </div>
  `;
};

const getEmployees = async (data) => {
  const res = await Service.search("com.axelor.apps.hr.db.Employee", {
    data,
    fields: [
      "contactPartner.emailAddress.address",
      "contactPartner.picture",
      "contactPartner.simpleFullName",
      "contactPartner.fixedPhone",
      "contactPartner.mobilePhone",
      "managerUser",
      "managerUser.employee.id",
      "mainEmploymentContract.companyDepartment",
      "mainEmploymentContract.payCompany",
      "mainEmploymentContract.companyDepartment.headOfDepartment.id",
      "mainEmploymentContract.payCompany.headOfCompany.id",
    ],
  });
  return res?.status === 0 ? res?.data : [];
};

export default function OrgChartEditor({ parameters = {} }) {
  const { id } = parameters;
  const [collapse, setCollapse] = useState(true);
  const [planning, setPlanning] = useState(true);
  const [employees, setEmployees] = useState(true);
  const diagramContainer = useRef();
  const editorContainer = useRef();
  const diagramRef = useRef(null);
  const editorRef = useRef(null);

  // function handleEdit() {
  //   setCollapse(false);
  //   const editor = editorRef.current;
  //   const diagram = diagramRef.current;
  //   editor && diagram && editor.import(diagram);
  // }

  useEffect(() => {
    if (!id) return;
    (async () => {
      const res = await Service.search(
        "com.axelor.apps.hr.db.OrganizationChart",
        {
          data: {
            criteria: [
              {
                fieldName: "id",
                operator: "=",
                value: id,
              },
            ],
          },
          fields: [
            "company",
            "companyDepartmentSet",
            "company.headOfCompany.id",
          ],
        }
      );
      if (res?.status === 0) {
        const planning = res?.data && res?.data[0];
        setPlanning(planning);
        const { company, companyDepartmentSet } = planning || {};
        let criteria = [
          {
            fieldName: "mainEmploymentContract.payCompany.id",
            operator: "=",
            value: company?.id,
          },
        ];
        if (companyDepartmentSet?.length > 0) {
          criteria.push({
            fieldName: "mainEmploymentContract.companyDepartment.id",
            operator: "IN",
            value: companyDepartmentSet.map((c) => c.id),
          });
        }
        const employees = await getEmployees({
          criteria,
          operator: "and",
        });
        setEmployees(employees);
      }
    })();
  }, [id]);

  useEffect(() => {
    if (!employees.length || !planning) return;
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
      const sections = [];
      employees?.forEach((emp) => {
        const parent =
          emp["managerUser.employee.id"] ||
          emp["mainEmploymentContract.companyDepartment.headOfDepartment.id"] ||
          emp["mainEmploymentContract.payCompany.headOfCompany.id"];
        if (parent) {
          sections.push({
            id: emp?.id,
            name: emp["contactPartner.simpleFullName"],
            post: emp["mainEmploymentContract.companyDepartment"]?.name,
            phone: emp["contactPartner.fixedPhone"],
            mail: emp["contactPartner.emailAddress.address"],
            photo: emp["contactPartner.picture"],
            parent:
              emp?.id !== planning["company.headOfCompany.id"] ? parent : null,
          });
        }
      });
      const isValid = sections.find((s) => !s.parent);
      if (isValid?.id) {
        diagram.data.parse(_.uniqBy(sections, "id") || []);
      } else {
        window.alert(
          "No head of department found for this department & company"
        );
      }
      diagramRef.current = diagram;
      editorRef.current = editor;
    });

    return () => {
      const diagram = diagramRef.current;
      diagram && diagram.destructor();
    };
  }, [employees, planning]);

  return (
    <div
      className={`dhx-container_inner dhx_sample-container__${
        collapse ? "without" : "with"
      }-editor`}
    >
      {/* {collapse && <Button name="Edit" onClick={handleEdit} />} */}
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
