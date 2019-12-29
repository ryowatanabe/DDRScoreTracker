const TAB_STATE = {
  IDLE: 0,
  MOVING: 1
};
const NUM_OF_TABS = 4;

let tabIndex = 0;
let tabState = TAB_STATE.IDLE;

for (var i = 0; i < NUM_OF_TABS; i++){
  $("#tab-" + i).click(moveTabTo.bind(null, i));
}

MENU_DATA.forEach(function(element){
  $("#link-" + element.id).click(function(){
    $("#tab-1")[0].innerHTML = element.name;
    refreshListImpl(element.condition);
    moveTabTo(1);
  });
});

function moveTabTo(toIndex) {
  if (tabState != TAB_STATE.IDLE){
    return;
  }
  tabState = TAB_STATE.MOVING;
  tabIndex = toIndex;

  $("#slide").attr('class', 'move-to-' + toIndex);
  $(".tab").attr('class', 'tab');
  $("#tab-" + toIndex).attr('class', 'tab selected');

  for (var i = toIndex + 1; i < NUM_OF_TABS; i++){
    $("#tab-" + i).attr('class', 'tab hidden');
  }
}

$('#slide').on('transitionend', function(){
  tabState = TAB_STATE.IDLE;
});
