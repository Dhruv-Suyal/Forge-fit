exports.getExerciseImage = async (query) => {

   try {

      const response = await fetch(

         `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1`,

         {
            headers: {
               Authorization:
                  `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
            }
         }
      );

      const data = await response.json();

      return data.results[0]?.urls?.regular || null;

   } catch (err) {

      console.log(err);

      return null;

   }

};