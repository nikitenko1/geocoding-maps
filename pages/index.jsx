import Place from "@/models/Place";
import { useRouter } from "next/router";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { CgMenuLeft } from "react-icons/cg";
import { BsSearch } from "react-icons/bs";
import { FaDirections } from "react-icons/fa";
import mapboxgl from "mapbox-gl";
import { useEffect, useRef, useState } from "react";
import useMenuModal from "@/hooks/useMenuModal";
import useLoginModal from "@/hooks/useLoginModal";
import axios from "axios";
import Layout from "@/components/Layout";
import Menu from "@/components/Menu";
import { toast } from "react-hot-toast";
import * as turf from "@turf/turf";
import { createGeoJSONCircle } from "@/libs/geoJSONCircle";
import Suggestions from "@/components/Suggestions";
import SuggestModal from "@/components/modals/Suggest";
import Message from "@/components/Message";
import Directions from "@/components/Directions";
import dbConnect from "@/libs/dbConnect";

const token = process.env.NEXT_PUBLIC_API_TOKEN;
// A NavigationControl control contains zoom buttons and a compass
mapboxgl.accessToken = token;

const Home = ({ places }) => {
  const { data: session } = useSession();
  //
  const router = useRouter();
  //
  const map = useRef(null);
  const mapContainer = useRef(null);
  //
  const { onOpen, onClose } = useMenuModal();
  const loginModel = useLoginModal();
  //
  const [currentPosition, setCurrentPosition] = useState(null);
  const [zoom] = useState(13);
  const [suggestions, setSuggestions] = useState([]);
  const [search, setSearch] = useState("");
  const [directions, setDirections] = useState(false);
  const [activeZone, setActiveZone] = useState(null);
  const [showZoneData, setShowZoneData] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [suggestCoords, setSuggestCoords] = useState(null);

  useEffect(() => {
    if (map.current) return; // initialize map only once

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [30.53608, 50.496656],
      zoom: zoom,
    });

    map.current.on("load", function () {
      map.current.addControl(new mapboxgl.NavigationControl(), "bottom-left");

      map.current.addControl(new mapboxgl.FullscreenControl());

      map.current.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true,
          },
          trackUserLocation: true,
          showUserHeading: true,
        })
      );

      map.current.on("geolocate", (event) => {
        console.log(event);
        map.current.setCenter([event.coords.longitude, event.coords.latitude]);
      });

      Notification.requestPermission();

      places.map((place) => {
        new mapboxgl.Marker({
          color: "#E9D502",
        })
          .setLngLat(place.coordinates)
          .addTo(map.current);

        const sourceId = `polygon${place._id}`;
        map.current.addSource(sourceId, createGeoJSONCircle(place.coordinates, 0.2));

        map.current.addLayer({
          id: sourceId,
          type: "fill",
          source: sourceId,
          layout: {},
          paint: {
            "fill-color": "#E9D502",
            "fill-opacity": 0.5,
          },
        });
      });

      navigator.geolocation.watchPosition(({ coords }) => {
        map.current.setCenter([coords.longitude, coords.latitude]);
        const userLocation = [coords.longitude, coords.latitude];
        setCurrentPosition(userLocation);

        // Check if the user is inside any of the polygons
        places.forEach((place) => {
          const sourceId = `polygon${place._id}`;
          const polygon = map.current.getSource(sourceId);

          // Use the Mapbox API to determine if the user is inside the polygon
          const insidePolygon = turf.booleanPointInPolygon(
            turf.point(userLocation),
            polygon._data.features[0]
          );

          if (insidePolygon) {
            setActiveZone(place);

            if (Notification.permission === "granted") {
              const nre = new Notification("Warning: Danger Ahead", {
                body: `You have entered accident prone zone ${place.name}.`,
                icon: "/warning.png",
              });
              console.log(nre);
            } else {
              toast.error("Please allow notifications for better experience");
              Notification.requestPermission().then((permission) => {
                if (permission === "granted") {
                  router.reload();
                }
              });
            }
          }
        });
      });
    });
  }, []);

  useEffect(() => {
    async function fetchSuggestions() {
      const res = await axios.get(
        // https://docs.mapbox.com/help/getting-started/geocoding/#search-result-prioritization
        // https://api.mapbox.com/geocoding/v5/{endpoint}/{search_text}.json
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${search}.json?&access_token=${token}`
      );
      console.log(res.data.features);
      setSuggestions(res.data.features);
    }
    search !== "" && fetchSuggestions();
  }, [search]);

  // features:[
  //   0:{
  //   id:"place.189673"
  //   type:"Feature"
  //   place_type:[...]
  //   relevance:1
  //   properties:{
  //   mapbox_id:"dXJuOm1ieHBsYzpBdVRw"
  //   wikidata:"Q1899"
  //   short_code:"UA-30"
  //   }
  //   text:"Kyiv"
  //   place_name:"Kyiv, Ukraine"
  //   bbox:[...]
  //   center:[...]
  //   geometry:{...}
  //   context:[...]
  //   }
  //   1:{...}
  //   2:{...}
  //   3:{...}
  //   4:{...}
  //   ]

  const handleSearch = (suggestion) => {
    const markers = document.querySelectorAll(".marker");
    markers.forEach((marker) => {
      marker.remove();
    });
    // https://docs.mapbox.com/help/tutorials/custom-markers-gl-js/
    map.current.setCenter(suggestion.geometry.coordinates);
    // create a HTML element for each feature
    const el = document.createElement("div");
    el.className = "marker location";
    // make a marker for each feature and add to the map
    new mapboxgl.Marker(el).setLngLat(suggestion.geometry.coordinates).addTo(map.current);
  };

  const handleBlackSpot = async () => {
    if (session?.user) {
      onClose();
      setShowMessage(true);

      // eslint-disable-next-line no-undef
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 3000); // Delay of 3 seconds
      });
      // https://docs.mapbox.com/help/tutorials/use-mapbox-gl-js-with-react/
      map?.current?.on("click", (e) => {
        setSuggestCoords([e.lngLat.lng, e.lngLat.lat]);
      });
    } else {
      loginModel.onOpen();
    }
  };
  return (
    <Layout>
      <Menu handleBlackSpot={handleBlackSpot} setDirections={setDirections} />

      <div ref={mapContainer} className=" w-screen h-screen" />
      <div
        className="absolute flex flex-col top-0 left-0 m-1 rounded-sm items-start w-[22rem]
      overflow-hidden bg-darkbg text-lightestSlate"
      >
        <div className="w-full h-full relative">
          <div className="flex items-center gap-2 px-2 h-12 border-b-[1px] border-gray-300">
            <CgMenuLeft size={45} className="cursor-pointer" onClick={() => onOpen()} />
            <input
              type="text"
              name="search"
              id="searchPlaces"
              className="px-2 h-full outline-none w-full bg-darkbg"
              placeholder="Search Places..."
              onChange={(e) =>
                e.target.value !== "" ? setSearch(e.target.value) : setSuggestions([])
              }
            />
            <div className="flex items-center gap-4">
              <BsSearch size={20} className="cursor-pointer" />
              <div className=" border-l-[1px] h-8 border-l-gray-300"></div>
              <FaDirections
                size={25}
                className="cursor-pointer text-blue-400"
                onClick={() => {
                  setSuggestions([]);
                  setDirections(true);
                }}
              />
            </div>
          </div>
          {suggestions.length > 0 && (
            <Suggestions suggestions={suggestions} handleClick={handleSearch} />
          )}
        </div>
      </div>
      {activeZone && (
        <div className="absolute bottom-2 right-2">
          <div
            className="p-3 bg-darkbg rounded-full cursor-pointer"
            onClick={() => setShowZoneData(!showZoneData)}
          >
            <Image src={"/warning.png"} height={30} width={30} alt="warning" />
          </div>
          {showZoneData && (
            <div
              className="absolute bottom-10 right-10 w-[300px] bg-darkbg text-lightSlate rounded-xl
            px-4 py-2 flex flex-col items-start"
            >
              <div className="flex items-center gap-2">
                <Image src={"/warning.png"} height={60} width={60} alt="warning" />
                <div className="flex flex-col">
                  <span className="font-semibold text-lightestSlate text-lg">
                    {activeZone.name}
                  </span>
                  <h4 className="text-sm">You are in a accident prone area</h4>
                </div>
              </div>
              <div className="flex flex-col gap-0">
                <div className="media">
                  <label>District</label>
                  <p>{activeZone.district}</p>
                </div>
                <div className="media">
                  <label>Jurisdiction</label>
                  <p>{activeZone.jurisdiction}</p>
                </div>
                <div className="media">
                  <label>Reason</label>
                  <p>{activeZone.reason}</p>
                </div>
                <div className="media">
                  <label>Intervention</label>
                  <p>{activeZone.intervention}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <Directions
        show={directions}
        setShow={setDirections}
        map={map.current}
        currentPosition={currentPosition}
      />
      {showMessage && <Message message={`Select place on the map by a click.`} time={3000} />}

      {suggestCoords && (
        <SuggestModal suggestCoords={suggestCoords} setSuggestCoords={setSuggestCoords} />
      )}
    </Layout>
  );
};

export default Home;

export async function getServerSideProps() {
  await dbConnect();

  const res = await Place.find().lean();

  return {
    props: {
      places: JSON.parse(JSON.stringify(res)),
    },
  };
}
