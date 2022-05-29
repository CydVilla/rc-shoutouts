const list = document.querySelector("#list");
const newPersonForm = document.querySelector(".new");
const reloadButton = document.querySelector("#reload");

newPersonForm.addEventListener("submit", addPerson);
list.addEventListener("click", enableEditForm);
list.addEventListener("click", cancelEdit);
list.addEventListener("click", removeSingle);
list.addEventListener("submit", submitEdit);

function addPerson(e) {
  e.preventDefault();

  const form = new FormData();
  const data = {
    name: newPersonForm.querySelector("#name").value,
    "file-to-upload": newPersonForm.querySelector("#image").files[0],
  };

  addPersonDOM();

  for (property in data) form.set(property, data[property]);

  fetch("add", {
    method: "post",
    body: form,
  });
}

function addPersonDOM() {
  const newPerson = document.createElement("li");
  const editForm = document.createElement("form");
  const editActiveDiv = document.createElement("div");
  const opacityDiv = document.createElement("div");
  const newInfo = document.createElement("section");
  let children = ["name", "image", "DELETE", "Edit"];

  newInfo.classList.add("info");
  newPerson.classList.add("person");
  editForm.classList.add("editForm", "hide");
  list.appendChild(newPerson);
  newPerson.appendChild(editActiveDiv);
  newPerson.appendChild(editForm);
  editActiveDiv.appendChild(opacityDiv);
  opacityDiv.appendChild(newInfo);

  children.forEach((child, i) => {
    let el;
    switch (i) {
      case 0:
      case 1:
        el = document.createElement("h2");
        break;
      case 2:
      case 3:
        el = document.createElement("h3");
        break;
      case 4:
        el = document.createElement("h4");
        break;
      case 5:
        {
          el = document.createElement("img");
          el.src = URL.createObjectURL(
            newPersonForm.querySelector(`#${child}`).files[0]
          );
        }
        break;
      case 6:
      case 7:
        {
          el = document.createElement("button");
          el.innerText = child;
        }
        break;
    }
    el.classList.add(child.toLowerCase());
    if (i < 10) {
      // el.innerText = newPersonForm.querySelector(`#${child}`).value;
      newInfo.appendChild(el);
    } else opacityDiv.appendChild(el);
  });

  children = ["Name", "Image", "Submit", "Cancel"];
  children.forEach((child, i) => {
    let label,
      input,
      placeHolder = "Enter ",
      innerText = child;
    const div = document.createElement("div");
    switch (i) {
      case 1:
        placeHolder += "name";
        innerText = "Name:";
        break;
      case 2:
        innerText = "Image";
        break;
      case 3:
        let submit = document.createElement("input");
        submit.setAttribute("type", "submit");
        submit.classList.add("submit", "submitEdit");
        submit.value = child;
        editForm.appendChild(submit);
        break;
      case 4:
        let cancel = document.createElement("button");
        cancel.setAttribute("type", "button");
        cancel.classList.add(`${child.toLowerCase()}Edit`);
        cancel.innerText = child;
        editForm.appendChild(cancel);
    }
    if (i <= 5) {
      label = document.createElement("label");
      input = document.createElement("input");
      label.htmlFor = child.toLowerCase();
      label.innerText = innerText;
      input.classList.add(child.toLowerCase());
      if (i < 5) {
        input.setAttribute("name", `new${child}`);
        input.setAttribute("type", "text");
        input.placeholder =
          placeHolder + (i === 0 || i === 4) ? child.toLowerCase() : "";
      } else if (i === 5) {
        input.setAttribute("name", "file-to-upload");
        input.setAttribute("type", "file");
      }
      div.appendChild(label);
      div.appendChild(input);
      editForm.appendChild(div);
    }
  });
}

function cancelEdit(e) {
  if (e.target.className === "cancelEdit") {
    const person = e.target.closest(".person");
    person.querySelector(".editForm").classList.add("hide");
    person.querySelector(".person > div > div").classList.remove("opacity");
    person.querySelector(".person > div").classList.remove("editActive");
  }
}

function enableEditForm(e) {
  if (e.target.className === "edit") {
    const person = e.target.closest(".person");
    console.log(person);
    person.querySelector(".editForm").classList.remove("hide");
    person.querySelector(".person > div > div").classList.add("opacity");
    person.querySelector(".person > div").classList.add("editActive");
  }
}

function submitEdit(e) {
  e.preventDefault();
  const personEl = e.target.closest(".person");
  const newName = personEl.querySelector("form .name").value;
  const newImage = personEl.querySelector("form .image").files[0];

  const form = new FormData();
  const data = {
    name: personEl.querySelector(".info .name").innerText,
    image: imagePath(personEl.querySelector(".image").src),
    newName: newName,
    filetoupload: newImage,
  };
  for (property in data) form.set(property, data[property]);

  fetch("edit", {
    method: "put",
    body: form,
  }).then(function (response) {
    window.location.reload();
  });
}

function imagePath(path) {
  for (i = 0; i < path.length; i++) {
    if (i < path.length - 3) {
      if (path[i] + path[i + 1] + path[i + 2] === "img") {
        return path.slice(path.indexOf(path[i]), path.length);
      }
    }
  }
}
function taskComplete(e) {
  if (e.target.tagName === "SPAN") {
    fetch("markCompleted", {
      method: "put",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        task: e.target.innerText,
        completed: e.target.classList.contains("done"),
      }),
    }).then(function (response) {
      window.location.reload();
    });
  }
}

function removeSingle(e) {
  if (e.target.className === "delete") {
    const info = e.target.closest(".person");
    fetch("delete", {
      method: "delete",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: info.querySelector(".info .name").innerText,
        image: imagePath(info.querySelector(".image").src),
      }),
    }).then(function (response) {
      window.location.reload();
    });
  }
}

function removeCompleted() {
  fetch("completedTasks", {
    method: "delete",
    headers: { "Content-Type": "application/json" },
  }).then(function (response) {
    window.location.reload();
  });
}

function removeAll() {
  fetch("clear", {
    method: "delete",
    headers: { "Content-Type": "application/json" },
  }).then(function (response) {
    window.location.reload();
  });
}

