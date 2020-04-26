// from https://stackoverflow.com/a/32652433
export function updateThemeOnActivePage(newTheme:string) {
  let rmbtnClasses = '';
  let rmhfClasses = '';
  let rmbdClassess = '';
  const arr = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's']; // I had themes from a to s
  //@ts-ignore //TODO index is not used, but I don't want to change it
  $.each(arr, function(index, value:string) {
      rmbtnClasses = rmbtnClasses + ' ui-btn-up-' + value + ' ui-btn-hover-' + value;
      rmhfClasses = rmhfClasses + ' ui-bar-' + value;
      rmbdClassess = rmbdClassess + ' ui-body-' + value + ' ui-page-theme-'+ value;
  });
  // reset all the buttons widgets
  $.mobile.activePage.find('.ui-btn').not('.ui-li-divider').removeClass(rmbtnClasses).addClass('ui-btn-up-' + newTheme).attr('data-theme', newTheme);
  // reset the header/footer widgets
  $.mobile.activePage.find('.ui-header, .ui-footer').removeClass(rmhfClasses).addClass('ui-bar-' + newTheme).attr('data-theme', newTheme);
  // reset the page widget
  $.mobile.activePage.removeClass(rmbdClassess).addClass('ui-body-' + newTheme + ' ui-page-theme-'+ newTheme).attr('data-theme', newTheme);
  // target the list divider elements, then iterate through them and
  // change its theme (this is the jQuery Mobile default for
  // list-dividers)
  //@ts-ignore //TODO index and obj are not used
  $.mobile.activePage.find('.ui-li-divider').each(function(index, obj) {
      $(this).removeClass(rmhfClasses).addClass('ui-bar-' + newTheme).attr('data-theme', newTheme);
  });
};