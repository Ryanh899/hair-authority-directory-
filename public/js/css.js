
$('.search-input').focus(function(){
    $(this).parent().addClass('focus');
  }).blur(function(){
    $(this).parent().removeClass('focus');
  })
  
  $('.sticky')
    .sticky({
      context: '#page-container'
    })
  ;
  
  $('.menu .item')
    .tab()
  ;
  
  $('.logo-images')
    .popup()
  ;
