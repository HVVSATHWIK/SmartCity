# Smart City — Road Layout Design (Detailed Project Plan)

**Goal:** design road layouts that **smooth traffic flow** and **reduce pollution**, using Python and probability-based models and simulations.

---

## 1. Project overview & objectives

* **Primary objective:** propose road-layout changes (e.g., one-way conversions, roundabouts, lane changes, signal vs roundabout) that reduce average travel time and lower emissions.
* **Secondary objectives:** reduce stops, reduce idle time, keep safety considerations in mind.
* **Deliverables:** working Jupyter notebook, simulation code, baseline vs suggested-layout comparison, visualizations, short report/slides.

---

## 2. Key Performance Indicators (KPIs)

* **Avg travel time per vehicle (minutes)**
* **95th percentile travel time (minutes)**
* **Avg emissions per vehicle (g CO₂ or proxy)**
* **Avg stops per vehicle**
* **Total vehicle-hours traveled (VHT)** and **vehicle-hours of delay (VHD)**
* **Queue spillback occurrences** (count of overloaded links)

---

## 3. Data: where to get it & what you need

**Essential datasets**

* **Road network geometry & attributes**: OpenStreetMap (via OSMnx) or a city open-data portals. You need node locations, link length, free-flow speed, lanes (if available).
* **Traffic counts / detectors**: loop detectors, manual counts, or aggregated hourly counts for major links/intersections — used to calibrate demand and capacities.
* **Probe / floating car data (FCD)**: GPS traces, travel times — used to validate travel-time outputs.
* **Signal timing data** (if available): phases, cycle lengths, green splits.

**If you don't have real city data:**

* Build a small synthetic network (grid or radial) and generate synthetic demand via gravity or Poisson processes. This is fine for methodological demonstration.

**What each dataset gives you**

* Network: nodes/edges, lengths, geometry.
* Counts: origin/destination flows or link-hour counts (vph).
* FCD: travel-time ground truth for validation.

---

## 4. Tools & libraries (Python stack)

* **Core**: Python 3.10+
* **Data**: `pandas`, `numpy`
* **Graphs / network**: `networkx`, `osmnx` (to fetch OSM), `geopandas`, `shapely`
* **Simulation**: `simpy` for event-driven simulations OR custom time-step simulation (NumPy loops). `simpy` recommended if you model vehicles individually.
* **Optimization**: `scipy.optimize`, `deap` (GA), or `nevergrad` / `simulated-annealing` custom.
* **Probabilistic & stats**: `scipy.stats`, `statsmodels`
* **Visualization**: `matplotlib`, `plotly`, `folium` (map overlays), `seaborn` (optional)
* **Notebook & reproducibility**: `jupyter`, `git`, `requirements.txt` / `poetry`, `Docker` (optional)
* **Extras**: `tqdm` (progress bars), `pytest` (tests)

---

## 5. High-level project flow (step-by-step)

1. **Define scope & small test area** — Decide network size (small grid, or actual neighborhood). Fix KPIs and weights for multi-objective scoring.
2. **Acquire/build network** — Pull OSM network via OSMnx or create synthetic graph with `networkx`.
3. **Collect or create demand (OD)** — If counts exist, convert to OD; otherwise create synthetic OD using gravity or random hotspots and use Poisson arrivals.
4. **Baseline modeling** — Implement a simple travel-time model (BPR or M/M/1 style). Compute baseline KPIs.
5. **Add probabilistic components** — Poisson arrival generator, stochastic route choice (logit), random incidents as Bernoulli trials.
6. **Simulation engine** — Choose event-driven (SimPy) or time-step; implement vehicle movement, queueing on edges, signal controls.
7. **Layout candidate generation** — Define parameterized modifications (one-way toggles, lane counts, control types) and generate alternative layouts.
8. **Evaluation loop (Monte Carlo)** — For each layout: run N simulations (random seeds/demand samples), collect KPI distributions.
9. **Optimization / Search** — Find best layouts under objective function(s) using random search / simulated annealing / GA.
10. **Calibration & validation** — Compare simulation outputs against counts or FCD; tune capacity or delay parameters.
11. **Visualization & report** — Maps, histograms, travel-time scatter plots; write final presentation.

---

## 6. Data pipeline details

**Ingestion**

* Use `osmnx.graph_from_place()` or `graph_from_bbox()` to fetch roads.
* Clean graph: keep vehicle-usable roads, unify CRS (use EPSG:3857 or local CRS), compute `length_km` if absent.

**Map-matching & OD**

* If you have probe traces, use map-matching (simple snapping to nearest edge) to attribute trip segments to edges.
* Build an OD matrix: if you only have link counts, use a demand estimation method (e.g., iterative proportional fitting) or assume simple gravity model.

**Synthetic OD generation**

* Create origin/destination hotspots with hourly rates (vph). For experiments, a few ODs (e.g., 4–10 pairs) with different intensities is sufficient.
* Convert OD rates into arrivals per minute using Poisson sampling in the simulation.

**Preprocessing checks**

* Ensure no disconnected components; convert one-way edges correctly; ensure capacity & lane attributes exist (if not, infer defaults: lane=1, free\_speed\_kmph=30–50).

---

## 7. Modeling components (details & recommended formulas)

### 7.1. Travel time model

* **Free flow time**: `t_ff = length_km / free_speed_kmph * 60` (minutes)
* **BPR function** (common): `t = t_ff * (1 + alpha * (flow / capacity)**beta)`; typical `alpha=0.15`, `beta=4`.
* **Queueing (M/M/1-like)**: for edge with service `mu` (veh/h) and arrival `lambda` (flow): delay ≈ `(rho / (1 - rho)) * t_service`, where `rho = lambda/mu`.
* Use a cap to avoid infinite delays when flow ≥ mu.

### 7.2. Route choice

* **Deterministic shortest path** (baseline): use travel-time weights.
* **Logit / stochastic**: probability of path `p` is `exp(-theta * cost_p) / sum_q exp(-theta * cost_q)`; implement via sampling or via route sampling with added Gumbel noise (approx logit).
* **Markov routing**: at each node choose outgoing edge according to transition probabilities that may depend on local congestion.

### 7.3. Arrival processes

* **Poisson arrivals** at origins: independent arrivals per origin with rate `lambda` vehicles/hour. Inter-arrival times \~ Exponential(1/lambda).
* Use Poisson for aggregated demand sampling in Monte Carlo runs.

### 7.4. Incidents & accidents

* Model as **Bernoulli trials** per time step with small p; if incident occurs, reduce capacity of affected link by X% for Y minutes.

### 7.5. Emissions model

* Start simple: emissions per edge traversal = `g_per_km(speed) * length_km + idle_g_per_min * idle_minutes`.
* `g_per_km(speed)` can be a piecewise function (high at low speeds, lowest near 40–60 km/h). Add stop penalty per stop.
* Later: replace with a smoother function or use an emissions model (COPERT-style) if available.

---

## 8. Simulation architecture (detailed)

### Option A: Event-driven (recommended for realism)

* Use `simpy` where each vehicle is a process that: spawns at origin at its arrival time → requests to traverse edges sequentially → waits if link queue full or signal red → exits at destination.
* Maintain per-edge resources representing lane capacity or saturation flow.
* Advantages: accurate queuing and per-vehicle emissions; expensive computationally for large networks.

### Option B: Time-step macroscopic simulation (faster)

* Discretize time (e.g., 1-5 second or 10-second steps). At each step update flows on edges using flow conservation and fundamental diagram / speed–flow relationships.
* Advantages: faster, easier for city-scale experiments; coarser vehicle detail.

### Core building blocks

* **Edge object**: length, lanes, capacity, current queue, waiting list of vehicles.
* **Signal controller**: cycle length, phases, green splits; vehicles traverse only on green.
* **Vehicle agent**: path, current edge, timestamp entry/exit, emissions accumulated.

---

## 9. Traffic assignment & convergence

* For static assignment tests, you can use **incremental assignment** or **method of successive averages (MSA)** to approximate user equilibrium (UE) or stochastic UE.
* For dynamic assignment inside simulation, use repeated calls to route choice based on current edge travel times and re-route some fraction of vehicles if delays change significantly.

---

## 10. Optimization & search for layout design

**Design variables**

* Edge-level: `is_one_way` (bool), `lanes` (integer), `control` (signal/roundabout), `speed_limit`.

**Objective(s)**

* Single-objective: `J = w1 * avg_travel_time + w2 * avg_emissions` (choose w1,w2)
* Multi-objective: Pareto front between time and emissions.

**Optimization algorithms**

* **Random search / hill-climbing** (simple baseline)
* **Simulated annealing** (cheap and effective)
* **Genetic algorithms** (deap) if you have many binary/nominal variables
* Keep the optimization budget small (each evaluation is expensive — use surrogate models if needed)

---

## 11. Validation & calibration

* **Calibrate** capacity and delay parameters so model reproduces observed counts or travel times. Use small parameter search to minimize RMSE between modelled and observed link volumes/travel-times.
* **Sensitivity analysis**: vary key parameters (arrival rates, capacities) to see stability.

---

## 12. Visualization & reporting

* Static maps: `osmnx.plot_graph`, `networkx` edge coloring by speed or flow.
* Interactive maps: `folium` with edge overlays colored by KPI.
* Time series & distributions: `matplotlib` / `plotly` (CDFs of travel time, violin plots).
* Dashboard option: a small `Dash` app showing map + KPI sliders.

---

## 13. Example code snippets (starter pieces)

```python
# 7 - Ranesh Chandra
# Fetch a small network with OSMnx (example) and compute basic attributes
import osmnx as ox
import networkx as nx
G = ox.graph_from_place('Your City, Country', network_type='drive')
G = ox.add_edge_speeds(G)   # estimate speeds if missing
G = ox.add_edge_travel_times(G)
# convert to networkx DiGraph with attributes length_km, free_speed_kmph, lanes
for u, v, k, data in G.edges(keys=True, data=True):
    data['length_km'] = data.get('length', 0) / 1000.0
    data['free_speed_kmph'] = data.get('speed_kph', 30)
    data['lanes'] = int(data.get('lanes', 1))
```

```python
# 8 - Ranesh Chandra
# Poisson demand sampler for an OD pair (lambda_vph -> arrivals with arrival times in minutes)
import numpy as np
rng = np.random.default_rng(123)

def sample_poisson_arrivals(lambda_vph, sim_minutes=60):
    lam_per_min = lambda_vph / 60.0
    n = rng.poisson(lam_per_min * sim_minutes)
    # sample arrival times uniformly over the hour, or use exponential inter-arrivals
    inter = rng.exponential(scale=1/lam_per_min, size=n)
    arrival_mins = np.cumsum(inter)
    arrival_mins = arrival_mins[arrival_mins <= sim_minutes]
    return arrival_mins
```

```python
# 9 - Ranesh Chandra
# BPR function (link travel time as function of flow)
def bpr_travel_time(t_ff_min, flow_vph, capacity_vph, alpha=0.15, beta=4):
    return t_ff_min * (1 + alpha * (flow_vph / max(1e-6, capacity_vph))**beta)
```

```python
# 10 - Ranesh Chandra
# Simple Monte Carlo loop skeleton
results = []
for seed in [1,2,3,4,5]:
    rng = np.random.default_rng(seed)
    # sample demand, run simulation, collect KPIs
    kpis = run_simulation_and_collect_kpis(G, od_matrix, rng)
    results.append(kpis)
# aggregate results
```

---

## 14. Testing, reproducibility & code hygiene

* Write unit tests for travel-time functions and small network behaviors.
* Use deterministic RNG seeds for reproducibility; always record seeds for runs.
* Keep configuration in a `config.yaml` or JSON (network area, OD intensities, simulation minute length, seed, optimization budget).

---

## 15. Common pitfalls & tips

* **Not enough Monte Carlo runs** → noisy comparisons. Use at least 5–20 runs depending on variance.
* **Uncalibrated capacity parameters** → unrealistic delays. Calibrate with counts if available.
* **Overfitting to a synthetic demand** → perform sensitivity tests.
* **Too large network with event-driven sim** → computationally heavy. Start small and scale gradually.

---

## 16. Suggested timeline (5 weeks, adaptable)

* **Week 1:** data & network setup, baseline model, basic KPIs
* **Week 2:** probabilistic demand generation, simple simulation, emissions proxy
* **Week 3:** candidate layouts, evaluate 5–10 layouts with Monte Carlo
* **Week 4:** optimization loop, refine best layouts, calibration
* **Week 5:** visualization, report, slides, final checks

---

## 17. Next steps (what I can do now)

If you want, I can:

* Inspect your notebook and adapt this plan to your current code.
* Provide a runnable minimal example (small grid) implementing the simulation skeleton.
* Help set up OSMnx ingestion and a synthetic OD generator that plugs into your notebook.

Good luck — this is an excellent, well-scoped project that will show strong application of probability and simulation in urban design. If you want, tell me which subtask you'd like code for first (e.g., OSM ingestion, Poisson demand generator, or SimPy vehicle agent) and I will add runnable code next.
