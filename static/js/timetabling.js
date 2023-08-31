Parse.initialize("viGGnxrB3M4nkQh0d3I8a35x0ybLrGB78F6GxdmU", "WNVtQaz9fVf84E5n4rTlSzQ8cALlO0VvAQ2CHN06");
Parse.serverURL = 'https://parseapi.back4app.com/';

const studentSelect = document.querySelector("#student");
const ttPlaceholder = document.querySelector("#timetable-placeholder");
const ttContainer = document.querySelector("#timetable-container");
const ttBody = document.querySelector("#timetable-body")
const studentClassList = document.querySelector("#classes")
const insightSelect = document.querySelector("#insight")
const insightArgumentSelect = document.querySelector("#insight-argument")

const Student = Parse.Object.extend("Student");
const Class = Parse.Object.extend("Class");

let query = new Parse.Query(Student);
query.find().then(res => {
  res.forEach(student => {
    let option = new Option(student.get("firstName"), student.id);
    studentSelect.appendChild(option);
  })
})

function resetTimetable() {
  ttBody.replaceChildren();
  for (let i = 0; i < 9; i++) {
    let row = document.createElement("tr");
    for (let j = 0; j < 5; j++) {
      let cell = document.createElement("td");
      cell.classList.add("border");
      row.appendChild(cell);
    }
    ttBody.appendChild(row);
  }
}

studentSelect.onchange = () => {
  resetTimetable();
  for (const child of studentClassList.children) {
    child.innerText = "";
  }
  insightSelect.firstElementChild.selected = true;
  insightArgumentSelect.classList.add("d-none");

  if (studentSelect.value === "") {
    ttPlaceholder.classList.remove("d-none");
    document.querySelectorAll(".requires-selection").forEach(e => e.classList.add("d-none"));
  } else {
    ttPlaceholder.classList.add("d-none");
    document.querySelectorAll(".requires-selection").forEach(e => e.classList.remove("d-none"));

    let query = new Parse.Query(Student);
    query.get(studentSelect.value).then(student => {
      let classes = {}
      !(async () => {
        let i = 0;
        for (const classType of ["A", "B", "C", "D", "PDT", "Discussion", "Enrichment"]) {
          let classObj = await student.get(`class${classType}`).fetch()
          classes[classObj.get("ident")] = classObj;
          if (classObj.get("ident").includes("Di")) continue;
          studentClassList.children[i].textContent = classObj.get("ident");
          i++;
        }
      })().then(() => {


        let timetable = JSON.parse(student.get("ttJson"));

        for (const [dayNo, day] of timetable.entries()) {

          for (const [periodNo, period] of day.entries()) {
            let ident = period.split(":")[0];
            let args;
            if (period.includes(":")) {
              args = period.split(":")[1].split(",");
              if (args[0] === "") {
                args[0] = 1;
              }
              if (args[1] === "" || args[1] === undefined) {
                args[1] = 1;
              }
            } else {
              args = [1, 1];
            }

            if (ident === "fr") {
              continue;
            }

            let classObj = classes[ident]
            ttBody.children[periodNo].children[dayNo].innerHTML = `${classObj.get("displayName")}
${ident}
${classObj.get("teacher" + args[0].toString())}
${classObj.get("room" + args[1].toString())}`;
          }
        }
      });
    });
  }
}

insightSelect.onchange = () => {
  if (insightSelect.value === "") {
    insightArgumentSelect.classList.add("d-none");
  } else {
    insightArgumentSelect.classList.remove("d-none");
    insightArgumentSelect.replaceChildren();
    switch (insightSelect.value) {
      case "periods":
        for (const child of studentSelect.children) {
          if (child.value !== studentSelect.value) {
            insightArgumentSelect.appendChild(child.cloneNode(true));
          }
        }
        break;
      case "people":
        break;
    }
  }
}
