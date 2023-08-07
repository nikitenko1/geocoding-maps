import React from "react";
import {
  BsSignTurnLeftFill,
  BsSignTurnRightFill,
  BsSignTurnSlightLeftFill,
  BsSignTurnSlightRightFill,
} from "react-icons/bs";
import { TbArrowRoundaboutLeft } from "react-icons/tb";

const Step = ({ step }) => {
  let Icon = null;
  let size = null;
  // coordinates: A semicolon-separated list of between two and 25 {longitude},{latitude} coordinate pairs
  // fork	Take the left or right side of a fork
  // turn	A basic turn in the direction of the modifier
  if (step.maneuver.type === "turn" || "fork") {
    size = 25;
    switch (step.maneuver?.modifier) {
      case "right":
        Icon = BsSignTurnRightFill;
        break;
      case "left":
        Icon = BsSignTurnLeftFill;
        break;
      case "slight left":
        Icon = BsSignTurnSlightLeftFill;
        break;
      case "slight right":
        Icon = BsSignTurnSlightRightFill;
        break;
      default:
        break;
    }
  }
  // roundabout Traverse roundabout
  else if (step.maneuver.type === "roundabout") {
    size = [25];
    Icon = TbArrowRoundaboutLeft;
  }
  if (step.maneuver.type === "arrive") Icon === null;

  // distance: The distance between each pair of coordinates, in meters
  const distance = step.distance / 1000;
  // https://docs.mapbox.com/api/navigation/directions/#maneuver-types
  return (
    <div className="mb-6 flex flex-col items-start text-lightSlate hover:text-lightestSlate">
      <div className="flex items-start gap-4 mb-2">
        {/* Indicates departure from a leg */}
        {step.maneuver.type === "depart" && <img src="/src.png" className="w-6 mt-2" alt="" />}
        {/* Indicates arrival to a destination of a leg */}
        {step.maneuver.type === "arrive" && <img src="/dest.png" className="w-6" alt="" />}
        {Icon !== null && step.maneuver.type !== "arrive" && <Icon size={25} />}
        <span className=" text-base font-semibold cursor-pointer">
          {/* A human-readable instruction of how to execute the returned maneuver */}
          {step?.maneuver?.instruction}
        </span>
      </div>
      {step?.maneuver?.type !== "arrive" && (
        <div className="flex items-center gap-6 ml-3">
          <div className="flex items-center flex-col gap-[2px] text-slate translate-y-[2px] mr-2">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
          <span className="text-xs font-normal">
            {distance < 1 ? `${(distance * 100).toFixed(1)} m` : `${distance.toFixed(1)} km`}
          </span>
        </div>
      )}
    </div>
  );
};

export default Step;
