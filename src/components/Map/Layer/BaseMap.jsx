import React from 'react'
import { LayersControl } from 'react-leaflet'

const BaseMap = () => {
  return (
    <div>
      <LayersControl position='topright'>

        <LayersControl.BaseLayer>
            <TileLayer url='https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png' />
        </LayersControl.BaseLayer>

      </LayersControl>
    </div>
  )
}

export default BaseMap
