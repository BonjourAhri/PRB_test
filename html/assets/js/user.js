$(function () {
  var path = window.location.pathname;

  function activeIcon(status) {
    var active_icon = "<i class='check circle icon teal'></i>"
    if (!status) active_icon = "<i class='times circle icon red'></i>"
    return active_icon
  }

  function deleteUser(id, callback) {
    var r = confirm("Are you sure you want to delete this record?");
    if (r == true) {
      $.ajax({
        type: "DELETE",
        url: BASE_URL + "/users/" + id,
        success: function () {
          if (callback) callback()
        }
      })
    }
  }

  // Disable this function to normal user
  const currentUser = JSON.parse(localStorage.getItem("me"));
  const isAdmin = currentUser.role === "admin";

  // List
  if ($("#user-list").length) {
    if (!isAdmin) return;

    $.ajax({
      type: "GET",
      url: BASE_URL + "/users",
      success: function (result) {
        if (result.status === 200) {
          // Success
          var data = result.data;
          var list_html = "";

          for (var i = 0; i < data.length; i++) {
            var item = data[i];

            var active_icon = activeIcon(item.active)

            list_html += '<tr href="/user-details.html?id=' + item.id + '" id="user-' + item.id + '">';
            // = Body
            list_html +=
              "<td><h4>" +
              (item.name || "N/A") +
              "</h4></td>";
            list_html += "<td>" + (item.username || "N/A") + "</td>";
            list_html += "<td>" + (item.role || "None") + "</div>";
            list_html += "<td>" + (active_icon) + "</td>";
            list_html += "<td> <a href='/user-details.html?id=" + item.id + "'>View</a> </td>";
            list_html += "</tr>";
          }
          $("#user-list").html(list_html);
        } else {
          // Error
          $("#user-list").empty().addClass("error").append(result.data);
        }
      },
    });
  }

  // Search
  $("#user-search-input").on("input", function () {
    var dInput = this.value.toUpperCase();
    var txtValue, a;

    // Loop through all list items, and hide those who don't match the search query
    $("#user-list .user-item").each(function (i) {
      a = $(this).find("h4")[0];
      txtValue = a.textContent || a.innerText;

      if (txtValue.toUpperCase().indexOf(dInput) > -1) {
        $(this).show();
      } else {
        $(this).hide();
      }
    });
  });

  // User details
  if (path.includes("/user-details.html")) {
    if (!isAdmin) return;

    var id = getUrlParameter("id");

    if (currentUser.id == id) {
      $("#user-delete-btn").hide();
    }

    // Edit button href modify
    $("#user-edit-btn").attr("href", "user-new.html?id=" + id);

    // Add click event for delete button
    $("#user-delete-btn").click(function(e) {
      e.preventDefault();
      deleteUser(id, function() {
        location.href = "/user-list.html";
      })
    })

    $.ajax({
      type: "GET",
      url: BASE_URL + "/users/" + id,
      success: function (result) {
        if (result.status === 200) {
          // Success
          var data = result.data;
          console.log(data)
          $("#user-name").val(data.name);
          $("#user-username").val(data.username);
          $("#user-role").val(data.role);
          $("#user-active").val(data.active == 1 ? 'Yes' : 'No');
          $("#user-updated").val(new Date(data.gmtUpdate).toLocaleString());
        } else {
          // Error
          $("#user-detail").empty().addClass("error").append(result.data);
        }
      },
    });
  }

  // Edit own profile 
  
  if (path.includes('/edit-profile')) {
    const currentUser = JSON.parse(localStorage.getItem("me"));
    var id = currentUser.id;
    console.log(currentUser);
    if (id) {
      $("#page-title").text("Edit profile");
      $.ajax({
        type: "GET",
        url: BASE_URL + "/users/" + id,
        success: function (result) {
          if (result.status === 200) {
            // Success
            var data = result.data;
            console.log(data)

            $("#name").val(data.name);
            $("#username").val(data.username);
          } else {
            alert("Cannot get user detail");
          }
        },
      });

      $('#profile-edit-form')
        .form({
          fields: {
            name: 'empty',
            repassword: 'match[password]',
          }
        })
        .api({
          url: BASE_URL + '/users/' + id,
          method: 'PUT',
          beforeXHR: (xhr) => {
            xhr.setRequestHeader('Content-Type', 'application/json');
          },
          beforeSend: (settings) => {
            const currentUser = JSON.parse(localStorage.getItem("me"));
            var fields = $(this).form('get values');
            console.log(fields, currentUser)
            settings.data = JSON.stringify({
              name: fields.name,
              username: fields.username,
              password: fields.password || currentUser.password,
              role: currentUser.role,
              active: 1,
            })
            return settings
          },
          onSuccess: function (result) {
            if (result.status !== 200) {
              $(this).form('add errors', [result.data]);
            } else {
              localStorage.setItem("me", JSON.stringify(result.data))
              window.location = "/home.html";
            }
          },
          onFailure: function (error, fields) {
            // invalid response
            console.log('err', fields)
            $(this).form('add errors', [error.message]);
          },
        });
    }
  }

  // User edit & create
  if (path.includes("user-new")) {
    if (!isAdmin) return;

    var id = getUrlParameter("id");

    if (id) {
      $("#page-title").text("Edit user");
      $.ajax({
        type: "GET",
        url: BASE_URL + "/users/" + id,
        success: function (result) {
          if (result.status === 200) {
            // Success
            var data = result.data;

            $("#name").val(data.name);
            $("#username").val(data.username);
            $("#role").val(data.role);
            $("#active").val(data.active ? "true" : "false");
            $("#password").val(data.password);
          } else {
            alert("Cannot get user detail");
          }
        },
      });

      $('#user-new-form')
        .form({
          fields: {
            name: 'empty',
            username: 'empty',
          }
        })
        .api({
          url: BASE_URL + '/users/' + id,
          method: 'PUT',
          beforeXHR: (xhr) => {
            xhr.setRequestHeader('Content-Type', 'application/json');
          },
          beforeSend: (settings) => {
            var fields = $(this).form('get values');
            settings.data = JSON.stringify({
              name: fields.name,
              username: fields.username,
              password: fields.password || '123456',
              role: fields.role,
              active: fields.active == "true" ? 1 : 0,
            })
            return settings
          },
          onSuccess: function (result) {
            if (result.status !== 200) {
              $(this).form('add errors', [result.data]);
            } else {
              window.location = "/user-list.html";
            }
          },
          onFailure: function (error, fields) {
            // invalid response
            console.log('err', fields)
            $(this).form('add errors', [error.message]);
          },
        });
    } else {
      if (!isAdmin) return;

      $('#user-new-form')
        .form({
          fields: {
            name: 'empty',
            username: 'empty',
          }
        })
        .api({
          url: BASE_URL + '/users',
          method: 'POST',
          beforeXHR: (xhr) => {
            xhr.setRequestHeader('Content-Type', 'application/json');
          },
          beforeSend: (settings) => {
            var fields = $(this).form('get values');
            settings.data = JSON.stringify({
              name: fields.name,
              username: fields.username,
              password: fields.password || '123456',
              role: fields.role,
              active: fields.active == "true" ? 1 : 0,
            })
            return settings
          },
          onSuccess: function (result) {
            if (result.status !== 200) {
              $(this).form('add errors', [result.data]);
            } else {
              window.location = "/user-list.html";
            }
          },
          onFailure: function (error, fields) {
            // invalid response
            console.log('err', fields)
            $(this).form('add errors', [error.message]);
          },
        });
    }
  }
});
