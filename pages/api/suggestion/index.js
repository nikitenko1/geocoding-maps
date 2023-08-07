import dbConnect from "@/libs/dbConnect";
import Suggestion from "@/models/Suggestion";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "POST") {
    try {
      const newSuggestion = new Suggestion(req.body);
      const savedSuggestion = await newSuggestion.save();

      res.status(200).json(savedSuggestion);
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  } else {
    res.status(500).json({ message: "Method not allowed" });
  }
}
