const { MongoClient } = require("mongodb");

exports.handler = async (event, context) => {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  // Mengambil parameter kategori dengan fallback
  const category = event.queryStringParameters && event.queryStringParameters.category;

  try {
    await client.connect();
    const database = client.db("quiz_db");
    const collection = database.collection("questions");

    // 1. Membangun Query Filter
    let query = {};
    if (category && category !== "Semua") {
      // Escape special characters di regex untuk keamanan
      const sanitizedCategory = category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query = { category: { $regex: new RegExp("^" + sanitizedCategory + "$", "i") } };
    }

    // 2. Ambil data soal
    // Kita gunakan projection { _id: 0 } jika Anda tidak butuh ID di sisi frontend
    let questions = await collection.find(query).toArray();

    // Jika database kosong, berikan array kosong agar frontend tidak crash
    if (!questions || questions.length === 0) {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify([]),
      };
    }

    // 3. Algoritma Fisher-Yates (Pengacakan)
    for (let i = questions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [questions[i], questions[j]] = [questions[j], questions[i]];
    }

    // 4. Batasi jumlah soal yang dikirim (Misal: 10 soal agar user tidak bosan)
    const limitedQuestions = questions.slice(0, 10);

    return {
      statusCode: 200,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store" // Memastikan user selalu dapat soal acak baru
      },
      body: JSON.stringify(limitedQuestions),
    };
  } catch (error) {
    console.error("Fetch Quiz Error:", error);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Gagal mengambil soal", details: error.message }),
    };
  } finally {
    await client.close();
  }
};