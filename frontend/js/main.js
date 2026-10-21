document.addEventListener("DOMContentLoaded", () => {
  // Hàm tải component
  const loadComponent = (elementId, filePath) => {
    fetch(filePath)
      .then((response) => {
        if (!response.ok) throw new Error("Không thể tải file: " + filePath);
        return response.text();
      })
      .then((data) => {
        document.getElementById(elementId).innerHTML = data;
      })
      .catch((error) => console.error(error));
  };

  // Tải Header và Footer
  loadComponent("app-header", "components/header.html");
  loadComponent("app-footer", "components/footer.html");
});
