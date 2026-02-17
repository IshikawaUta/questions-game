const { MongoClient, ObjectId } = require("mongodb");

exports.handler = async (event, context) => {
  const client = new MongoClient(process.env.MONGODB_URI);
  const method = event.httpMethod;
  const data = JSON.parse(event.body || "{}");

  try {
    await client.connect();
    // Sesuaikan nama database di bawah ini jika berbeda (contoh: quiz_db)
    const col = client.db("quiz_db").collection("questions");

    switch (method) {
      case "GET":
        const allQuestions = await col.find({}).sort({ createdAt: -1 }).toArray();
        return { statusCode: 200, body: JSON.stringify(allQuestions) };

      case "POST":
        // FITUR BARU: Cek jika data yang masuk adalah ARRAY (untuk Bulk Import)
        if (Array.isArray(data)) {
          const formattedQuestions = data.map(q => ({
            text: q.text,
            options: q.options, // Array pilihan
            correct: q.correct,
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

        // Jika data adalah OBJECT tunggal (untuk form tambah soal biasa)
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
        
        const updatedQuestion = {
          text: data.text,
          options: data.options,
          correct: data.correct,
          timer: parseInt(data.timer) || 15,
          category: data.category || "Umum"
        };
        
        await col.updateOne(
          { _id: new ObjectId(data.id) },
          { $set: updatedQuestion }
        );
        return { statusCode: 200, body: JSON.stringify({ message: "Update Berhasil" }) };

      case "DELETE":
        if (!data.id) return { statusCode: 400, body: "ID diperlukan untuk menghapus" };
        
        await col.deleteOne({ _id: new ObjectId(data.id) });
        return { statusCode: 200, body: JSON.stringify({ message: "Soal Berhasil Dihapus" }) };

      default:
        return { statusCode: 405, body: "Metode Tidak Diizinkan" };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  } finally {
    await client.close();
  }
};