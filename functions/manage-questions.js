const { MongoClient, ObjectId } = require("mongodb");

exports.handler = async (event, context) => {
  const client = new MongoClient(process.env.MONGODB_URI);
  const method = event.httpMethod;
  let data;

  try {
    data = JSON.parse(event.body || "{}");
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: "Format JSON tidak valid" }) };
  }

  try {
    await client.connect();
    const col = client.db("quiz_db").collection("questions");

    switch (method) {
      case "GET":
        // Sort berdasarkan waktu terbaru agar soal baru muncul di atas
        const allQuestions = await col.find({}).sort({ createdAt: -1 }).toArray();
        return { 
          statusCode: 200, 
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(allQuestions) 
        };

      case "POST":
        // FITUR: Bulk Import (Array)
        if (Array.isArray(data)) {
          // Validasi: Pastikan data tidak kosong
          if (data.length === 0) return { statusCode: 400, body: "Array tidak boleh kosong" };

          const formattedQuestions = data.map(q => ({
            text: q.text || "Pertanyaan Tanpa Judul",
            options: Array.isArray(q.options) ? q.options : ["A", "B", "C", "D"],
            correct: q.correct || "",
            timer: parseInt(q.timer) || 15,
            category: q.category || "Umum",
            createdAt: new Date()
          }));

          const result = await col.insertMany(formattedQuestions);
          return { 
            statusCode: 201, 
            body: JSON.stringify({ message: "Bulk Import Berhasil", count: result.insertedCount }) 
          };
        }

        // FITUR: Single Import (Object dari Form)
        const newQuestion = {
          text: data.text,
          options: data.options,
          correct: data.correct,
          timer: parseInt(data.timer) || 15,
          category: data.category || "Umum",
          createdAt: new Date()
        };
        const insertRes = await col.insertOne(newQuestion);
        return { statusCode: 201, body: JSON.stringify(insertRes) };

      case "PUT":
        if (!data.id) return { statusCode: 400, body: "ID diperlukan untuk update" };
        
        const updatedFields = {
          text: data.text,
          options: data.options,
          correct: data.correct,
          timer: parseInt(data.timer) || 15,
          category: data.category || "Umum",
          updatedAt: new Date() // Tambahkan jejak update
        };
        
        const updateResult = await col.updateOne(
          { _id: new ObjectId(data.id) },
          { $set: updatedFields }
        );
        
        return { 
          statusCode: 200, 
          body: JSON.stringify({ message: "Update Berhasil", modifiedCount: updateResult.modifiedCount }) 
        };

      case "DELETE":
        if (!data.id) return { statusCode: 400, body: "ID diperlukan untuk menghapus" };
        
        await col.deleteOne({ _id: new ObjectId(data.id) });
        return { statusCode: 200, body: JSON.stringify({ message: "Soal Berhasil Dihapus" }) };

      default:
        return { statusCode: 405, body: "Metode Tidak Diizinkan" };
    }
  } catch (error) {
    console.error("Database Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error", details: error.message }),
    };
  } finally {
    await client.close();
  }
};