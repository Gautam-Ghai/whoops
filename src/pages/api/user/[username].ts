import { NextApiRequest, NextApiResponse } from "next";
import nc from 'next-connect';
import { prisma } from "../../../../lib/prisma";
import cloudinary from 'cloudinary';
import { IncomingForm } from 'formidable';
import { v4 as uuid } from "uuid";
import { getUserId, getUserProfile } from "@/queries/User";

const fileName = uuid()

const apiRoute = nc<NextApiRequest, NextApiResponse>({

    onError: (err, req, res, next) => {
        console.error('error', err);
        res.status(500).end("Something broke!");
      },
    
      // Handle any other HTTP method
      onNoMatch: (req, res, next) => {
        res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
      },
  
})
.get(async( req, res ) => {

  const { username } = req.query;

  let userDetails = await getUserProfile(username);

  if(userDetails){
    userDetails = JSON.parse(JSON.stringify(userDetails))
    res.send(userDetails)
  }
    
})
.post(async( req, res ) => {
    const data = await new Promise((resolve, reject) => {
        const form = new IncomingForm();

        form.parse(req, (err, fields, files) => {
            if (err) return reject(err);
            resolve({ fields, files });
        });
    });

  const { username } = req.query;

  const user = await getUserProfile(username);

  let resultImage = null
  let resultWebsite = null
  let resultAbout = null
  let deleteBanner = null

  if(user){
    let file = null
    if(data?.files?.banner){
      console.log('file',data?.files?.banner)
      file = data?.files?.banner.filepath ;
    }

      if(file){
        console.log('file', file)
        if(user.bannerImageId && user.bannerImageId.length > 0){
            deleteBanner = await cloudinary.v2.uploader.destroy(user.bannerImageId,  {type : 'upload', resource_type : 'image'})
        }
        
        const response = await cloudinary.v2.uploader.upload(file, {
          resource_type: 'image',
          public_id: `${fileName}`,
          upload_preset: 'whoops-user'
        });

        console.log('response', response)

      
        if(response){
          console.log('file uploaded')
          resultImage = await prisma.userProfile.update({
            data: {
              bannerImage: response.url,
              bannerImageId: response.public_id
            },
            where: {
              username: username
            }
          })
        }
      }

    if(data?.fields?.about && data?.fields?.about.length >0){
      resultAbout = await prisma.userProfile.update({
        data: {
          description: data?.fields?.about
        },
        where: {
          username: username
        }
      })
    }

    if(data?.fields?.website && data?.fields?.website.length >0){
      console.log("website", data?.fields?.website)
      resultWebsite = await prisma.userProfile.update({
        data: {
          website: data?.fields?.website
        },
        where: {
          username: username
        }
      })
    }

    if(resultAbout || resultWebsite || resultImage){
      res.send("updated")
    }
  } else {
    res.status(401).json({ error: `You don't have the access to edit this profile` });
  }
})

export const config = {
  api: {
    bodyParser: false
  }
}

export default apiRoute;