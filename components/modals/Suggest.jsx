import axios from "axios";
import { useSession } from "next-auth/react";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { MdClose } from "react-icons/md";

const SuggestModal = ({ suggestCoords, setSuggestCoords }) => {
  const { data: session } = useSession();
  const [isloading, setIsloading] = useState(false);

  const [formdata, setFormData] = useState({
    name: "",
    district: "",
    jurisdiction: "",
    coordinates: suggestCoords,
    NH: "",
    reason: "",
    intervention: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formdata,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/api/suggestion`, {
        ...formdata,
        NH: parseInt(formdata.NH),
        user: session?.user?._id,
      });

      toast.success("Thank you for your suggestion. The Admin will be notified.");
      setSuggestCoords(null);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <>
      <div
        className={`w-[95%] sm:w-4/5 md:w-2/5 px-10 py-4 min-h-min max-h-max overflow-y-scroll rounded-md 
      absolute transition-all duration-300  z-[999] m-auto right-0 left-0 bg-darkbg text-lightestSlate
      overflow-hidden
      ${suggestCoords ? "bottom-0 top-0" : "bottom-[-200vh]"}`}
      >
        <MdClose
          className="absolute top-4 right-4 cursor-pointer"
          size={30}
          onClick={() => setSuggestCoords(null)}
        />
        <h1 className="text-xl md:text-2xl font-[600] leading-tight pt-4">
          Suggest a Black Spot
          <br />
          <span className=" text-base font-medium">Accident Prone place</span>
        </h1>
        <form className="mt-6" onSubmit={handleSubmit}>
          <Input
            type={"text"}
            name="name"
            id="name"
            label="Name"
            value={formdata.name}
            required={true}
            onChange={handleChange}
          />
          <Input
            type={"text"}
            name="district"
            id="district"
            label="District"
            value={formdata.district}
            onChange={handleChange}
            required={true}
          />
          <Input
            type={"text"}
            name="jurisdiction"
            id="jurisdiction"
            label="Jurisdiction"
            value={formdata.jurisdiction}
            onChange={handleChange}
            required={true}
          />
          <Input
            type={"text"}
            name="NH"
            id="NH"
            label="National Highway"
            value={formdata.NH}
            onChange={handleChange}
            required={true}
          />
          <Input
            type={"text"}
            name="reason"
            id="reason"
            label="Reason for accidents"
            value={formdata.reason}
            onChange={handleChange}
            required={true}
          />
          <Input
            type={"text"}
            name="intervention"
            id="intervention"
            label="Intervention"
            value={formdata.intervention}
            onChange={handleChange}
            required={true}
          />
          <Button disabled={isloading} type="submit" text="Add suggestion" onClick={() => {}} />
        </form>
      </div>
    </>
  );
};

export default SuggestModal;
