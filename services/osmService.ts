import { MapBounds, OsmData, OsmNode, RoadSegment } from '../types';

const OVERPASS_API_URL = "https://overpass-api.de/api/interpreter";

export const fetchAndParseOsmData = async (bounds: MapBounds): Promise<RoadSegment[]> => {
  const boundsStr = `${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()}`;
  
  // This query looks for major roads within the bounding box.
  const query = `
    [out:json][timeout:25];
    (
      way["highway"]["highway"!~"footway|path|steps|cycleway|pedestrian|track|service|corridor|bridleway|rest_area|escape"](${boundsStr});
    );
    (._;>;);
    out body;
  `;

  try {
    const response = await fetch(OVERPASS_API_URL, {
        method: 'POST',
        body: `data=${encodeURIComponent(query)}`,
    });

    if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    const data: OsmData = await response.json();
    
    const nodes = new Map<number, OsmNode>();
    data.elements.forEach(el => {
        if (el.type === 'node') {
            nodes.set(el.id, el);
        }
    });

    const segments: RoadSegment[] = [];
    data.elements.forEach(el => {
        if (el.type === 'way' && el.nodes.length > 1) {
            for (let i = 0; i < el.nodes.length - 1; i++) {
                const node1 = nodes.get(el.nodes[i]);
                const node2 = nodes.get(el.nodes[i + 1]);
                if (node1 && node2) {
                    segments.push({
                        start: { lat: node1.lat, lon: node1.lon },
                        end: { lat: node2.lat, lon: node2.lon },
                    });
                }
            }
        }
    });

    return segments;
  } catch (error) {
    console.error("Failed to fetch or parse OSM data:", error);
    throw error;
  }
};
