$(document).ready(() => {
  $("#button-scrape").on("click", event => {
    $.get("/scrape")
      .then(articles => {
        console.log(articles);
        $(".container").empty();
        for (let i = 0; i < articles.length; i++) {
          const aTag = $(`<a target="_blank" href="${articles[i].link}">`);
          // const h3 = $("<h3>").text(articles[i].title);
          // $(".container").append(aTag.append(h3));
          const card = $("<div class='card'>");
          const cardBody = $("<div class='card-body'>");
          const cardTitle = $("<h5 class='card-title'>").text(articles[i].title);
          const cardText = $("<p class='card-text'>").text(articles[i].summary);
          cardBody.append(cardTitle);
          cardBody.append(cardText);
          card.append(cardBody);
          $(".container").append(aTag.append(card));
        }
      })
      .catch(err => {
        console.log(err);
      });
  });

  $("#button-clear").on("click", event => {
    $.ajax({
      url: "/clear",
      type: "DELETE"
    })
      .then(function() {
        $(".container").empty();
        const h3 = $("<h3>").text(
          "There aren't any news articles scraped yet!"
        );
        $(".container").append(h3);
      })
      .catch(err => {
        console.log(err);
      });
  });
});
