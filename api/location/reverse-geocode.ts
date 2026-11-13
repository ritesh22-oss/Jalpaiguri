import type { VercelRequest, VercelResponse } from '@vercel/node';

// Ground-truth verified boundaries and landmarks for Jalpaiguri neighborhoods
const JALPAIGURI_GROUND_TRUTH = [
  { id: 'senpara', name: 'Senpara', locality: 'Senpara', lat: 26.53647, lng: 88.72564, radiusKm: 0.45 },
  { id: 'raikatpara', name: 'Raikatpara', locality: 'Raikatpara', lat: 26.53526, lng: 88.71979, radiusKm: 0.45 },
  { id: 'rajbari-para', name: 'Rajbari Para (Baikunthapur Palace)', locality: 'Rajbari Para', lat: 26.54103, lng: 88.71958, radiusKm: 0.5 },
  { id: 'kadamtala', name: 'Kadamtala', locality: 'Kadamtala', lat: 26.52537, lng: 88.72030, radiusKm: 0.5 },
  { id: 'dinbazar', name: 'Dinbazar Wholesale Market', locality: 'Dinbazar', lat: 26.51860, lng: 88.72910, radiusKm: 0.5 },
  { id: 'kamarpara', name: 'Kamarpara', locality: 'Kamarpara', lat: 26.52533, lng: 88.72165, radiusKm: 0.4 },
  { id: 'ashrampara', name: 'Ashrampara', locality: 'Ashrampara', lat: 26.51525, lng: 88.72697, radiusKm: 0.45 },
  { id: 'babupara', name: 'Babupara', locality: 'Babupara', lat: 26.52297, lng: 88.72738, radiusKm: 0.45 },
  { id: 'nayabasti', name: 'Nayabasti', locality: 'Nayabasti', lat: 26.51701, lng: 88.73039, radiusKm: 0.45 },
  { id: 'shanti-para', name: 'Shanti Para', locality: 'Shanti Para', lat: 26.53558, lng: 88.71206, radiusKm: 0.5 },
  { id: 'adarpara', name: 'Adarpara', locality: 'Adarpara', lat: 26.51339, lng: 88.72487, radiusKm: 0.5 },
  { id: 'tb-hospital-para', name: 'TB Hospital Para', locality: 'TB Hospital Para', lat: 26.54074, lng: 88.70731, radiusKm: 0.5 },
  { id: 'sadar-hospital', name: 'District Sadar Hospital Road', locality: 'Hospital Road', lat: 26.52943, lng: 88.72759, radiusKm: 0.4 },
  { id: 'goshala', name: 'Goshala More', locality: 'Goshala', lat: 26.54705, lng: 88.70913, radiusKm: 0.5 },
  { id: 'paharpur', name: 'Paharpur More', locality: 'Paharpur', lat: 26.55869, lng: 88.72444, radiusKm: 0.7 },
  { id: 'maskalaibari', name: 'Maskalaibari', locality: 'Maskalaibari', lat: 26.53478, lng: 88.70715, radiusKm: 0.5 },
  { id: 'deshbandhu-para', name: 'Deshbandhu Para', locality: 'Deshbandhu Para', lat: 26.53191, lng: 88.71139, radiusKm: 0.45 },
  { id: 'hakimpara', name: 'Hakimpara', locality: 'Hakimpara', lat: 26.52913, lng: 88.73125, radiusKm: 0.45 },
  { id: 'pandapara', name: 'Pandapara', locality: 'Pandapara', lat: 26.51723, lng: 88.72087, radiusKm: 0.5 },
  { id: 'town-station', name: 'Jalpaiguri Town Railway Station', locality: 'Town Station', lat: 26.51869, lng: 88.72415, radiusKm: 0.45 },
  { id: 'raninagar', name: 'Raninagar BSF & Industrial Area', locality: 'Raninagar', lat: 26.53963, lng: 88.63662, radiusKm: 1.5 },
  { id: 'mohitnagar', name: 'Mohitnagar Station & Farm Area', locality: 'Mohitnagar', lat: 26.53065, lng: 88.66768, radiusKm: 1.2 }
];

function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const latStr = (req.query.lat as string) || '';
  const lngStr = (req.query.lng as string) || '';

  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);

  if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return res.status(400).json({ error: 'Valid latitude and longitude are required.' });
  }

  // 1. High-Precision Nominatim Reverse Geocode with verified address breakdown
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const osmResponse = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'JalpaiguriConnectedApp/2.0 (civic.portal.wb@gmail.com)'
        }
      }
    );
    clearTimeout(timeoutId);

    if (osmResponse.ok) {
      const data = await osmResponse.json();
      if (data && data.address) {
        const addr = data.address;
        const road = addr.road || addr.pedestrian || addr.street || addr.highway || '';
        
        // Exact neighbourhood/suburb detection
        const rawLocality =
          addr.neighbourhood ||
          addr.suburb ||
          addr.residential ||
          addr.quarter ||
          addr.village ||
          addr.town ||
          addr.city_district ||
          addr.hamlet ||
          '';

        const city = addr.city || addr.town || addr.municipality || 'Jalpaiguri';
        const district = addr.state_district || addr.county || 'Jalpaiguri';
        const state = addr.state || 'West Bengal';
        const country = addr.country || 'India';
        const pincode = addr.postcode || '735101';

        // Check if there's a ground-truth locality match within its tight radius (< 500m)
        let exactMatchedLocality: string | null = null;
        let exactDistance = Infinity;
        for (const truth of JALPAIGURI_GROUND_TRUTH) {
          const d = calculateHaversineDistance(lat, lng, truth.lat, truth.lng);
          if (d <= truth.radiusKm && d < exactDistance) {
            exactDistance = d;
            exactMatchedLocality = truth.locality;
          }
        }

        // Priority for locality:
        // 1. Specific neighbourhood returned by geocoder (e.g. "Senpara", "Raikat Para", "Kadamtala")
        // 2. High-precision ground-truth match if coordinate is tightly within that locality boundary
        // 3. Road name if named
        // 4. City
        const finalLocality = rawLocality || exactMatchedLocality || (road ? `${road} Area` : city);
        
        // Proper formatted place name
        let formattedName = data.display_name;
        if (road && finalLocality && !formattedName.startsWith(road)) {
          formattedName = `${road}, ${finalLocality}, ${city}, ${state} ${pincode}`;
        } else if (finalLocality && !formattedName.startsWith(finalLocality)) {
          formattedName = `${finalLocality}, ${city}, ${state} ${pincode}`;
        }

        return res.json({
          success: true,
          lat,
          lng,
          name: formattedName || `${finalLocality}, Jalpaiguri`,
          locality: finalLocality,
          neighbourhood: rawLocality || exactMatchedLocality || '',
          road,
          city,
          district,
          state,
          country,
          pincode,
          source: 'osm-nominatim'
        });
      }
    }
  } catch (err) {
    console.warn('[REVERSE GEOCODE] Nominatim lookup notice:', (err as any)?.message);
  }

  // 2. High-Accuracy Ground Truth Fallback for Jalpaiguri (Tightly Scoped, No Wild Guessing)
  let bestMatch: (typeof JALPAIGURI_GROUND_TRUTH)[0] | null = null;
  let minDistance = Infinity;

  for (const item of JALPAIGURI_GROUND_TRUTH) {
    const d = calculateHaversineDistance(lat, lng, item.lat, item.lng);
    if (d < minDistance) {
      minDistance = d;
      bestMatch = item;
    }
  }

  // Only assign named locality if it's within 600m; beyond that, indicate exact coordinate area
  if (bestMatch && minDistance <= 0.6) {
    return res.json({
      success: true,
      lat,
      lng,
      name: `${bestMatch.name}, Jalpaiguri, West Bengal 735101`,
      locality: bestMatch.locality,
      neighbourhood: bestMatch.locality,
      road: '',
      city: 'Jalpaiguri',
      district: 'Jalpaiguri',
      state: 'West Bengal',
      country: 'India',
      pincode: '735101',
      distanceToLocalityCenterKm: minDistance,
      source: 'jalpaiguri-ground-truth'
    });
  }

  // Exact coordinates location if outside tight boundaries
  return res.json({
    success: true,
    lat,
    lng,
    name: `Location at ${lat.toFixed(5)}°, ${lng.toFixed(5)}°, Jalpaiguri`,
    locality: `Area near ${lat.toFixed(4)}°, ${lng.toFixed(4)}°`,
    neighbourhood: '',
    road: '',
    city: 'Jalpaiguri',
    district: 'Jalpaiguri',
    state: 'West Bengal',
    country: 'India',
    pincode: '735101',
    source: 'coordinate-point'
  });
}

