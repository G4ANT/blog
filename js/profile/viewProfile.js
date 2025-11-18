let display = document.getElementById("display");
getData();
function getData() {
  fetch(`${BASE_URL}/auth/profile`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      if (!data || !data.data) {
        console.error("User data not found", data);
        return;
      }

      const user = data.data;
      const avatar = user.avatar || "assets/images/defaultThumbnail.pbg";

      display.innerHTML = `

                        <!-- Avatar -->
                        <div class="col-12 col-md-3 text-center mb-3 mb-md-0">
                            <div class="d-flex flex-column justify-content-between">
                              <img src="${avatar}" alt="avatar" id="avatar"
                              class="rounded-circle shadow-sm border border-2 border-primary-subtle"
                              style="width:110px; height:110px; object-fit:cover;">
                              <button class="btn btn-danger btn-sm mt-2 w-50" onclick="deleteAvatar()">Delete profile</button>

                            </div>
                        </div>

                        <!-- User Info -->
                        <div class="col-12 col-md-9">
                        <div class="bg-light p-3 rounded-3 shadow-sm h-100 d-flex flex-column justify-content-between">
                            <div>
                            <p class="text-secondary mb-1"><strong>ID:</strong> ${user.id
        }</p>
                            <h5 class="fw-bold mb-1">${user.firstName} ${user.lastName}</h5>
                            <p class="text-muted mb-2">${user.email}</p>
                            </div><div class="d-flex flex-wrap justify-content-between align-items-center mt-2">
                            <div class="d-flex flex-wrap gap-2">
                                <button type="button" class="btn btn-primary btn-sm"
                                        data-bs-toggle="modal" data-bs-target="#updateModal"
                                        onclick="updateInformation(${user.id})">
                                Update Information
                                </button>
                                <button type="button" class="btn btn-outline-success btn-sm"
                                        onclick="updateAvatar(${user.id})">
                                Update Avatar
                                </button>
                            </div>

                            <div class="text-end mt-3 mt-md-0">
                                <small class="text-muted d-block">Joined</small>
                                <div class="fw-semibold">${new Date(
                                              user.registeredAt
                                            ).toLocaleDateString()}
                                </div>
                                <br>
                                <button type="button" class="btn btn-danger btn-sm"
                                        onclick="logout(${user.id})">
                                        Log out
                                </button>
                            </div>
                            </div>
                        </div>
                        </div>
                    `;
    })
    .catch((err) => console.log(err));
}

function updateInformation(id) {
  location.href = `updateProfile.html?id=${id}`;
}

function updateAvatar(id) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.style.display = "none";
  document.getElementById("display").appendChild(input);

  input.click();

  input.onchange = () => {
    const updatedAvatar = input.files[0];
    let formData = new FormData();
    formData.append("avatar", updatedAvatar);

    fetch(`${BASE_URL}/profile/avatar`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        showAlert("success", "Avatar updated", "Avatar updated successfully");
        setTimeout(() => {
          getData();
        }, 3000);
      })
      .catch((err) => console.log(err));
  };
}

function deleteAvatar() {
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "Cancel",
  })
    .then((result) => {
      if (result.isConfirmed) {

        fetch(`${BASE_URL}/profile/avatar`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          }
        })
          .then((res) => res.json())
          .then((data) => {
            showAlert("success", "Avatar delete", "Avatar deleted successfully");

            Swal.fire(
              "Deleted",
              "The profile is deleted!",
              "success"
            ).then(() => {
              getData();

            })
          })
          .catch((err) => {
            console.error("Error deleting profile:", err);
            Swal.fire("Error!", "Something went wrong while deleting.", "error");
          })
      }
    })
}

function logout() {
  Swal.fire({
    title: "Are you sure you want to log out?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, log me out",
    cancelButtonText: "Cancel",
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.removeItem("authToken");
      location.href = "../../auth/loginUser.html";
    }
  });
}
