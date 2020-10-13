import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import * as Yup from 'yup';

import Orphanage from '../models/Orphanage';
import orphanage_view from '../views/orphanages_view';

export default {
  async find(req: Request, res: Response) {
    const { id } = req.params;

    const orphanagesRepository = getRepository(Orphanage);
    const orphanage = await orphanagesRepository.findOneOrFail(id, {
      relations: ['images']
    });

    return res.status(201).json(orphanage_view.render(orphanage));
  },

  async index(req: Request, res: Response) {
    const orphanagesRepository = getRepository(Orphanage);
    const orphanages = await orphanagesRepository.find({
      relations: ['images']
    });

    return res.status(201).json(orphanage_view.renderMany(orphanages));

  },

  async create(req: Request, res: Response) {
    const {
      name,
      latitude,
      longitude,
      about,
      instructions,
      opening_hours,
      open_on_weekends,
    } = req.body;

    const orphanagesRepository = getRepository(Orphanage);

    const requestImages = req.files as Express.Multer.File[];
    const images = requestImages.map(image => {
      return { path: image.filename }
    });

    const data = {
      name,
      latitude,
      longitude,
      about,
      instructions,
      opening_hours,
      open_on_weekends,
      images,
    }

    const schema = Yup.object().shape({
      name: Yup.string().required('Todos os campos são obrigatórios'),
      latitude: Yup.number().required('Todos os campos são obrigatórios'),
      longitude: Yup.number().required('Todos os campos são obrigatórios'),
      about: Yup.string().required('Todos os campos são obrigatórios').max(300),
      instructions: Yup.string().required('Todos os campos são obrigatórios'),
      opening_hours: Yup.string().required('Todos os campos são obrigatórios'),
      open_on_weekends: Yup.boolean()
        .required('Todos os campos são obrigatórios'),
      images: Yup.array(Yup.object().shape({
        path: Yup.string().required('Todos os campos são obrigatórios')
      }))
    });

    await schema.validate(data, {
      abortEarly: false,
    });

    const orphanage = orphanagesRepository.create(data);

    await orphanagesRepository.save(orphanage);

    return res.status(201).json(orphanage);
  }
}
