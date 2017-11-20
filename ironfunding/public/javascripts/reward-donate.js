
$(document).ready(function(){
  $('.js-reward-form').on('submit', function(e) {
    e.preventDefault();

    let rewardForm   = $(e.currentTarget);

    let rewardId     = rewardForm.data('reward');

    let division=rewardForm.children()[1];

    let rewardAmount=$("#pledge-amount").val();
    //let rewardAmount = rewardForm.children('#pledge-amount')[0].value; (bad)

    $.ajax({
      url: `/rewards/${rewardId}/donate`,
      type: 'POST',
      data: { amount: rewardAmount },
      xhrFields: {
        withCredentials: true
      },
      success: displaySuccess,
      error: displayError
    });
  });
});

function displaySuccess(reward){
  console.log(reward);
  let theReward      = $(`.reward-wrapper[data-reward=${reward._id}]`)[0];
  let rewardContents = $(`.reward-wrapper[data-reward=${reward._id}] form`);

  rewardContents.fadeOut(2000, () => {
    $(theReward).children('.reward-success').show();
  });
}

function displayError(err){
  console.log(err);
}
