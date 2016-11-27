// window.addEventListener('load', _=> {
//
//   firebase.database().ref('/score')
//   .orderByChild('score')
//   .limitToLast(3).on('child_added' , function(ss) {
//     var s = ss.val();
//     let ex = [];
//     for (var e in s) {
//       ex.push(s[e].score);
//     }
//     console.log(s);
//   });
//
//   let app = document.querySelector('#app');
//    app.$.card.addEventListener('cancel', _=> {
//        start();
//        firebase.database().ref('/score').push(
//         {
//            name: app.$.nameInput.value,
//            score: score
//        });
//    })
// });
// //
