import ngeohash from "ngeohash";
import CustomError from "../../../helpers/CustomError";
import { COMMUNITY_CONFIG } from "./community.config";

export interface GeoPoint {
  type: "Point";
  coordinates: [number, number];
  address?: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export const isValidCoordinates = (lat: number, lng: number): boolean => {
  if (typeof lat !== "number" || typeof lng !== "number") return false;
  if (isNaN(lat) || isNaN(lng)) return false;
  if (lat < -90 || lat > 90) return false;
  if (lng < -180 || lng > 180) return false;
  return true;
};

export const assertValidCoordinates = (lat: number, lng: number): void => {
  if (!isValidCoordinates(lat, lng)) {
    throw new CustomError(400, "Invalid coordinates", [
      {
        field: "location",
        message: "Latitude must be -90 to 90 and longitude -180 to 180",
      },
    ]);
  }
};

// Convert lat/lng to GeoJSON Point (MongoDB expects [lng, lat])
export const toGeoPoint = (
  lat: number,
  lng: number,
  address?: string,
): GeoPoint => {
  assertValidCoordinates(lat, lng);

  const point: GeoPoint = {
    type: "Point",
    coordinates: [lng, lat],
  };

  if (address) {
    point.address = address;
  }

  return point;
};

export const fromGeoPoint = (point: GeoPoint): Coordinates => {
  const [lng, lat] = point.coordinates;
  return { lat, lng };
};

// Haversine formula — returns distance in km
export const calculateDistanceKm = (
  point1: Coordinates,
  point2: Coordinates,
): number => {
  const EARTH_RADIUS_KM = 6371;

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(point2.lat - point1.lat);
  const dLng = toRad(point2.lng - point1.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.lat)) *
      Math.cos(toRad(point2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
};

export const isWithinRadius = (
  center: Coordinates,
  point: Coordinates,
  radiusKm: number,
): boolean => {
  return calculateDistanceKm(center, point) <= radiusKm;
};

// Encode lat/lng to geohash string (used as Socket.IO room name)
export const encodeGeohash = (
  lat: number,
  lng: number,
  precision: number = COMMUNITY_CONFIG.GEOHASH_PRECISION,
): string => {
  assertValidCoordinates(lat, lng);
  return ngeohash.encode(lat, lng, precision);
};

// Returns center cell + 8 neighbors (9 total) for Socket.IO room joining
export const getGeohashWithNeighbors = (
  lat: number,
  lng: number,
  precision: number = COMMUNITY_CONFIG.GEOHASH_PRECISION,
): string[] => {
  const center = encodeGeohash(lat, lng, precision);
  const neighbors = ngeohash.neighbors(center);
  return [center, ...neighbors];
};

// $near query — sorted by distance (closest first)
export const buildNearQuery = (lat: number, lng: number, radiusKm: number) => {
  assertValidCoordinates(lat, lng);

  return {
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [lng, lat],
        },
        $maxDistance: radiusKm * 1000,
      },
    },
  };
};

// $geoWithin query — faster but not sorted by distance
export const buildGeoWithinQuery = (
  lat: number,
  lng: number,
  radiusKm?: number,
) => {
  assertValidCoordinates(lat, lng);

  const EARTH_RADIUS_KM = 6378.1;

  const finalRadiusKm = radiusKm ?? 50;

  if (finalRadiusKm <= 0) {
    throw new CustomError(400, "Radius must be greater than 0 km");
  }

  const radiusInRadians = finalRadiusKm / EARTH_RADIUS_KM;

  return {
    location: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radiusInRadians],
      },
    },
  };
};
