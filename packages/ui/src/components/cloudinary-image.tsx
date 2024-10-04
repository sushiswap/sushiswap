'use client'

import Image, { ImageProps } from 'next/image'
import { FC } from 'react'
import { cloudinaryImageLoader } from '../cloudinary'

type CloudinaryImage = Omit<ImageProps, 'loader'>

const CloudinaryImage: FC<CloudinaryImage> = (props) => {
  return <Image loader={cloudinaryImageLoader} {...props} />
}

export { CloudinaryImage }
