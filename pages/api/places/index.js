import dbConnect from "@/libs/dbConnect";
import Place from "@/models/Place";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "POST") {
    try {
      const newPlace = new Place(req.body);
      const savedPlace = await newPlace.save();

      res.status(200).json(savedPlace);
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  } else {
    res.status(500).json({ message: "Method not allowed" });
  }
}
