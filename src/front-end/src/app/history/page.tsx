'use client'
export const dynamic = 'force-dynamic'

import { useRecentExits } from '@/app/hooks/useRecentExits'

export default function RecentExits() {
  const { exitRecords } = useRecentExits()

  return (
    <div className="rounded-lg shadow bg-white p-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-3">Salidas Recientes</h2>
      <div className="max-h-[350px] overflow-y-auto space-y-3 pr-1 bg-gray-100">
        {exitRecords.map((record) => (
          <div
            key={record.id}
            className={`bg-white rounded-lg p-3 flex items-center shadow-sm border ${record.selected ? "border-blue-500 border-2" : "border-gray-200"
              }`}
          >
            <div className="flex items-center flex-1">
              <div
                className="w-8 h-8 rounded-full mr-2"
                style={{ backgroundColor: record.color }}
              />
              <div className="flex-1">
                <div className="flex justify-between">
                  <div>
                    <div className="text-gray-500 text-xs">Plate</div>
                    <div className="font-bold text-sm">{record.plate}</div>
                    <div className="text-gray-500 text-xs">Owner</div>
                    <div className="text-sm">{record.owner}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-500 text-xs">Time</div>
                    <div className="text-sm">{record.time}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
