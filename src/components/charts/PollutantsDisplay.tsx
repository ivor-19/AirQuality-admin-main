"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { ArrowDown, ArrowUp, Minus, RefreshCcw } from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { AnnouncementModal } from "../modals/AnnouncementModal"
import { Skeleton } from "../ui/skeleton"

interface AQILevel {
  max: number
  label: string
  color: string
  textColor: string
  bgColor: string
}

interface Reading {
  aqi: number
  pm2_5: number
  pm10: number
  co: number
  no2: number
  status: string
}

interface PollutantCardProps {
  title: string
  value?: number
  unit: string
  trend: React.ReactNode
  description: string
}

const aqiLevels: AQILevel[] = [
  { max: 20, label: "Very Low", color: "#DAF7A6", textColor: "text-emerald-500", bgColor: "var(--gray-counter)" },
  { max: 40, label: "Low", color: "#008000", textColor: "text-green-500", bgColor: "var(--gray-counter)" },
  { max: 90, label: "Moderate", color: "#FFC300", textColor: "text-amber-500", bgColor: "var(--gray-counter)" },
  { max: 200, label: "High", color: "#C70039", textColor: "text-orange-500", bgColor: "bg-gray-50" },
  { max: 280, label: "Very High", color: "#900C3F", textColor: "text-red-500", bgColor: "var(--gray-counter)" },
  { max: 400, label: "Extremely High", color: "#581845", textColor: "text-purple-800", bgColor: "var(--gray-counter)" },
]

const getAqiLevel = (aqi: number): AQILevel => {
  for (const level of aqiLevels) {
    if (aqi <= level.max) {
      return level
    }
  }
  return aqiLevels[aqiLevels.length - 1]
}

export function PollutantsDisplay() {
  const [model, setModel] = useState<string>("modelx21")
  const [readings, setReadings] = useState<Reading | null>(null)
  const [previousReadings, setPreviousReadings] = useState<Reading | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [lazy, setLazy] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchData = async (): Promise<void> => {
    setLoading(true)
    try {
      const response = await axios.get<{ aqReadings: Reading[] }>(
        `https://air-quality-back-end-v2.vercel.app/aqReadings/${model}`
      )
      const latestReadings = response.data.aqReadings[0]

      if (readings) {
        setPreviousReadings(readings)
      }

      if (latestReadings) {
        setReadings(latestReadings)
        setLastUpdated(new Date())
      }
      setLazy(false)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const intervalId = setInterval(fetchData, 2000)

    return () => clearInterval(intervalId)
  }, [model])

  const getTrend = (current: Reading | null, previous: Reading | null, field: keyof Reading): React.ReactNode => {
    if (!previous || !current) return <Minus className="h-4 w-4 text-gray-400" />

    const currentValue = current[field]
    const previousValue = previous[field]

    if (currentValue > previousValue) {
      return <ArrowUp className="h-4 w-4 text-red-500" />
    } else if (currentValue < previousValue) {
      return <ArrowDown className="h-4 w-4 text-green-500" />
    }
    return <Minus className="h-4 w-4 text-gray-400" />
  }

  const aqiLevel = readings ? getAqiLevel(readings.aqi) : aqiLevels[0]

  return (
    <>
      {lazy ? (
        <Skeleton className="w-full h-full"/>
      ):(
        <Card className="flex flex-col font-geist overflow-hidden">
          <CardHeader>
            <div>
              <CardTitle>Air Quality Index</CardTitle>
              <CardDescription>Real-time AQI Monitoring</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-1/2 p-6 flex flex-col items-center justify-center">
                <div className="relative">
                  <div className="flex flex-col items-center">
                    <div className={cn("text-8xl font-bold mb-2", aqiLevel.textColor)}>
                      {readings?.aqi.toLocaleString() || "0"}
                    </div>
                    <div className="text-xl text-muted-foreground mb-4">AQI</div>
                  </div>
                </div>
                <div className={cn("mt-2 px-4 py-2 rounded-full text-sm font-medium mb-2", aqiLevel.textColor)}>
                  {aqiLevel.label}
                </div>
                <AnnouncementModal />
                <div className="flex gap-2">
                  <span className="text-xs text-muted-foreground">
                    Device is turned: 
                  </span>
                  {readings?.status === "on" ? (
                    <span className="text-xs text-green-400 font-medium">ON</span>
                  ):(
                    <span className="text-xs text-red-800 font-medium">OFF</span>
                  )}
                </div>
              </div>
    
              <div className="w-full md:w-1/2 p-6">
                <h3 className="text-lg font-semibold mb-4">Pollutant Readings</h3>
                <div className="grid grid-cols-2 gap-4">
                  <PollutantCard
                    title="PM2.5"
                    value={readings?.pm2_5}
                    unit="μg/m³"
                    trend={getTrend(readings, previousReadings, "pm2_5")}
                    description="Fine particulate matter"
                  />
                  <PollutantCard
                    title="PM10"
                    value={readings?.pm10}
                    unit="μg/m³"
                    trend={getTrend(readings, previousReadings, "pm10")}
                    description="Coarse particulate matter"
                  />
                  <PollutantCard
                    title="CO"
                    value={readings?.co}
                    unit="ppm"
                    trend={getTrend(readings, previousReadings, "co")}
                    description="Carbon monoxide"
                  />
                  <PollutantCard
                    title="NO2"
                    value={readings?.no2}
                    unit="ppb"
                    trend={getTrend(readings, previousReadings, "no2")}
                    description="Nitrogen dioxide"
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t py-3 px-6 text-xs text-muted-foreground">
            <div className="flex justify-between w-full">
              <span>
                Last updated:{" "}
                {lastUpdated
                  ? new Intl.DateTimeFormat("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: true,
                    }).format(lastUpdated)
                  : "Never"}
              </span>
              <button
                onClick={fetchData}
                className="flex items-center gap-1 text-xs hover:text-foreground transition-colors"
              >
                <RefreshCcw className="h-3 w-3" /> Refresh
              </button>
            </div>
          </CardFooter>
        </Card>
      )}
    </>
  )
}

function PollutantCard({ title, value, unit, trend, description }: PollutantCardProps) {
  return (
    <div className="p-4 rounded-lg shadow-sm border">
      <div className="flex justify-between items-start mb-1">
        <div className="text-sm font-medium text-muted-foreground">{title}</div>
        <div>{trend}</div>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold">{value !== undefined ? value : "-"}</span>
        <span className="text-xs text-muted-foreground">{unit}</span>
      </div>
      <div className="text-xs text-muted-foreground mt-1">{description}</div>
    </div>
  )
}