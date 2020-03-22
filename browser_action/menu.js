function openMenu() {
  $("#menuContainer").addClass('active');
  $("#drawerBackground").addClass('active');
}
function closeMenu() {
  $("#menuContainer").removeClass('active');
  $("#drawerBackground").removeClass('active');
}

document.getElementById('openMenuButton').addEventListener("click", openMenu);
document.getElementById('closeMenuButton').addEventListener("click", closeMenu);
