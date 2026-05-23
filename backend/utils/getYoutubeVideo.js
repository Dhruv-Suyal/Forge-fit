exports.getExerciseVideo = async (query) => {

   try {

      const response = await fetch(

         `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&key=${process.env.YOUTUBE_API_KEY}&maxResults=1&type=video`
      );

      const data = await response.json();

      const videoId =
         data.items[0]?.id?.videoId;

      if (!videoId) return null;

      return `https://www.youtube.com/embed/${videoId}`;

   } catch (err) {

      console.log(err);

      return null;

   }

};