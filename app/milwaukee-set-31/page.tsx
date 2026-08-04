import { Metadata } from "next";
import MilwaukeeSetClient from "./MilwaukeeSetClient";

export const metadata: Metadata = {
  title: "Milwaukee Set 3.1 | Cartly.ba",
  description:
    "Milwaukee Set 3.1 — kompletan profesionalni set. Udarni odvijač 226 Nm, 2× baterija 5.0 Ah. Akcijska cijena 149 KM. Plaćanje pouzećem, dostava +10 KM širom BiH.",
};

export default function Page() {
  return <MilwaukeeSetClient />;
}
