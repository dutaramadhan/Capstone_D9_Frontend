import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";

export default function Loading() {
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-white opacity-75 z-50 flex items-center justify-center">
      <FontAwesomeIcon
        icon={faCircleNotch}
        spin
        className="fa-5x text-gray-600"
      />
    </div>
  );
}
