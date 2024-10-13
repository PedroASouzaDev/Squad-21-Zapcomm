var buttonContainer = document.getElementById("buttonContainer");
if(buttonContainer) {
      buttonContainer.addEventListener("click", function () {
            var popup = document.getElementById("integraesAddContainer");
            if(!popup) return;
            var popupStyle = popup.style;
            if(popupStyle) {
                  popupStyle.display = "flex";
                  popupStyle.zIndex = 100;
                  popupStyle.backgroundColor = "rgba(113, 113, 113, 0.3)";
                  popupStyle.alignItems = "center";
                  popupStyle.justifyContent = "center";
            }
            popup.setAttribute("closable", "");
            
            var onClick = popup.onClick || function(e) {
                  if(e.target === popup && popup.hasAttribute("closable")) {
                        popupStyle.display = "none";
                  }
            };
            popup.addEventListener("click", onClick);
      });
}

var dashboardContainer = document.getElementById("dashboardContainer");
if(dashboardContainer) {
      dashboardContainer.addEventListener("click", function (e) {
            // Add your code here
      });
}

var chamadosContainer = document.getElementById("chamadosContainer");
if(chamadosContainer) {
      chamadosContainer.addEventListener("click", function (e) {
            // Add your code here
      });
}

var kanbanContainer = document.getElementById("kanbanContainer");
if(kanbanContainer) {
      kanbanContainer.addEventListener("click", function (e) {
            // Add your code here
      });
}

var respostasRpidasContainer = document.getElementById("respostasRpidasContainer");
if(respostasRpidasContainer) {
      respostasRpidasContainer.addEventListener("click", function (e) {
            // Add your code here
      });
}

var agendamentosContainer = document.getElementById("agendamentosContainer");
if(agendamentosContainer) {
      agendamentosContainer.addEventListener("click", function (e) {
            // Add your code here
      });
}

var tagsContainer = document.getElementById("tagsContainer");
if(tagsContainer) {
      tagsContainer.addEventListener("click", function (e) {
            // Add your code here
      });
}

var chatInternoContainer = document.getElementById("chatInternoContainer");
if(chatInternoContainer) {
      chatInternoContainer.addEventListener("click", function (e) {
            // Add your code here
      });
}

var campanhasContainer = document.getElementById("campanhasContainer");
if(campanhasContainer) {
      campanhasContainer.addEventListener("click", function (e) {
            // Add your code here
      });
}

var informativosContainer = document.getElementById("informativosContainer");
if(informativosContainer) {
      informativosContainer.addEventListener("click", function (e) {
            // Add your code here
      });
}

var openAIContainer = document.getElementById("openAIContainer");
if(openAIContainer) {
      openAIContainer.addEventListener("click", function (e) {
            // Add your code here
      });
}

var integraesContainer = document.getElementById("integraesContainer");
if(integraesContainer) {
      integraesContainer.addEventListener("click", function (e) {
            window.location.href = "Integraes.html"
      });
}

var coneesContainer = document.getElementById("coneesContainer");
if(coneesContainer) {
      coneesContainer.addEventListener("click", function (e) {
            // Add your code here
      });
}

var listaDeArquivos = document.getElementById("listaDeArquivos");
if(listaDeArquivos) {
      listaDeArquivos.addEventListener("click", function (e) {
            // Add your code here
      });
}

var aPIContainer = document.getElementById("aPIContainer");
if(aPIContainer) {
      aPIContainer.addEventListener("click", function (e) {
            // Add your code here
      });
}

var filasEChatbot = document.getElementById("filasEChatbot");
if(filasEChatbot) {
      filasEChatbot.addEventListener("click", function (e) {
            // Add your code here
      });
}

var usuriosContainer = document.getElementById("usuriosContainer");
if(usuriosContainer) {
      usuriosContainer.addEventListener("click", function (e) {
            // Add your code here
      });
}

var ajudaContainer = document.getElementById("ajudaContainer");
if(ajudaContainer) {
      ajudaContainer.addEventListener("click", function (e) {
            // Add your code here
      });
}

var settingsContainer = document.getElementById("settingsContainer");
if(settingsContainer) {
      settingsContainer.addEventListener("click", function (e) {
            // Add your code here
      });
}