import React from "react";

const Suggestion = ({ suggestion, handleClick }) => {
  // place_name: "Berlin, Germany"
  const address = suggestion.place_name.split(",").slice(1).join(",").trim();
  return (
    <div
      onClick={() => handleClick(suggestion)}
      className="px-2 py-1 flex flex-col items-start gap-[2px] 
 w-[21rem] hover:bg-slate rounded-md bg-bg cursor-pointer"
    >
      <h2
        className="suggestion_item font-semibold text-[14px] text-lightestSlate
      hover:text-[#0e2127]"
      >
        {suggestion.text}
      </h2>
      <span
        className="suggestion_item font-normal text-[12px] text-lightSlate
      hover:text-white"
      >
        {address}
      </span>
    </div>
  );
};

export default Suggestion;
