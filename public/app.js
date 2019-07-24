$(document).ready(() => {
  $("#button-scrape").on("click", event => {
    $.get("/scrape")
      .then(articles => {
        console.log(articles);
        $(".container").empty();
        for (let i = 0; i < articles.length; i++) {
          const aTag = $(`<a target="_blank" href="${articles[i].link}">`);
          const h3 = $("<h3>").text(articles[i].title);
          $(".container").append(aTag.append(h3));
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
