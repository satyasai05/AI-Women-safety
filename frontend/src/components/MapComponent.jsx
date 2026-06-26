import { GoogleMap, LoadScript, Polyline, Marker } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const center = {
  lat: 17.385044,
  lng: 78.486671,
};

const MapComponent = ({ route }) => {
  const path = route?.map((step) => ({ lat: step.latitude || center.lat, lng: step.longitude || center.lng })) || [];

  return (
    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""}>
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={13}>
        {path?.length > 0 && <Polyline path={path} options={{ strokeColor: "#6D28D9", strokeWeight: 4 }} />}
        {path?.map((position, index) => (
          <Marker key={index} position={position} />
        ))}
      </GoogleMap>
    </LoadScript>
  );
};

export default MapComponent;
