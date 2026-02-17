const { MongoClient } = require("mongodb");

exports.handler = async (event, context) => {
  const client = new MongoClient(process.env.MONGODB_URI);
  // Mengambil parameter kategori dari URL
  const category = event.queryStringParameters.category;

  try {
    await client.connect();
    // Pastikan nama DB konsisten dengan manage-questions.js yaitu "quiz_db"
    const database = client.db("quiz_db");
    const collection = database.collection("questions");

    // Filter berdasarkan kategori
    let query = {};
    if (category && category !== "Semua") {
      // Menggunakan regex case-insensitive agar lebih fleksibel (Sains vs sains)
      query = { category: { $regex: new RegExp("^" + category + "$", "i") } };
    }

    // Ambil data soal
    let questions = await collection.find(query).toArray();

    // Algoritma Fisher-Yates untuk mengacak soal
    for (let i = questions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [questions[i], questions[j]] = [questions[j], questions[i]];
    }

    // Opsional: Batasi hanya 10 soal per sesi agar kuis tidak terlalu panjang
    // questions = questions.slice(0, 10);

    return {
      statusCode: 200,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" // Mencegah masalah CORS saat testing
      },
      body: JSON.stringify(questions),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Gagal mengambil soal", details: error.message }),
    };
  } finally {
    await client.close();
  }
};