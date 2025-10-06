import { Injectable } from '@angular/core';
import PocketBase from 'pocketbase';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private pb: PocketBase;
  private readonly baseUrl = 'https://db.buckapi.site:8020';
  private readonly collection = 'products';

  constructor() {
    this.pb = new PocketBase(this.baseUrl);
  }


// En products.service.ts
/* async uploadImage(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('type', 'product'); // o el tipo que prefieras
      
      const record = await this.pb.collection('images').create(formData);
      return record.id;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  } */
 // En products.service.ts
 async uploadImage(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('type', 'product');
      
      const record = await this.pb.collection('images').create(formData);
  
      // Construir la URL completa del archivo
      const baseUrl = 'https://db.buckapi.site:8020/api/files';
      const collectionId = record['collectionId'];
      const recordId = record['id'];
      const filename = record['image'];
  
      const imageUrl = `${baseUrl}/${collectionId}/${recordId}/${filename}`;
  
      return imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }
  
  
  async createProduct(productData: any, imageFiles: File[] = []) {
    try {
      // Si no hay imágenes, crear el producto sin imágenes
      if (imageFiles.length === 0) {
        const data = {
          ...productData,
          price: Number(productData.price),
          stock: Number(productData.stock)
        };
        return await this.pb.collection('products').create(data);
      }
  
      // Si hay imágenes, subirlas primero
      const imageIds = [];
      for (const file of imageFiles) {
        try {
          const imageId = await this.uploadImage(file);
          imageIds.push(imageId);
        } catch (error) {
          console.error('Error uploading image, skipping...', error);
          // Continuar con las demás imágenes
        }
      }
  
      // Si no se pudo subir ninguna imagen
      if (imageIds.length === 0) {
        throw new Error('No se pudo subir ninguna imagen');
      }
  
      // Crear el producto con las imágenes
      const data = {
        ...productData,
        price: Number(productData.price),
        stock: Number(productData.stock),
        // Usar la primera imagen como imagen principal
        image: imageIds[0],
        // Guardar todos los IDs de imágenes como string JSON
        images: JSON.stringify(imageIds)
      };
  
      const record = await this.pb.collection('products').create(data);
      return record;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }
  
  /* async createProduct(productData: any, imageFiles: File[] = []) {
    try {
      // 1. Subir las imágenes y obtener sus IDs
      const imageUploadPromises = imageFiles.map(file => this.uploadImage(file));
      const imageIds = await Promise.all(imageUploadPromises);
  
      // 2. Crear el objeto del producto con la relación a las imágenes
      const data = {
        ...productData,
        price: Number(productData.price),
        stock: Number(productData.stock),
        // Si solo quieres una imagen principal, usa image: imageIds[0] || ''
        // Si quieres múltiples imágenes, necesitarías un campo de relación múltiple
        image: imageIds[0] || '', // Usamos la primera imagen como imagen principal
        images: JSON.stringify(imageIds) // Guardamos todos los IDs como JSON
      };
  
      // 3. Crear el producto
      const record = await this.pb.collection('products').create(data);
      return record;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  } */
  // En products.service.ts
async createProductWithMultipleImages(productData: any, imageFiles: File[] = []) {
    try {
      // Subir todas las imágenes
      const imageUploadPromises = imageFiles.map(file => this.uploadImage(file));
      const imageIds = await Promise.all(imageUploadPromises);
  
      // Crear el producto con las relaciones
      const data = {
        ...productData,
        price: Number(productData.price),
        stock: Number(productData.stock),
        // Usar la primera imagen como imagen principal
        image: imageIds[0] || '',
        // Guardar todos los IDs de imágenes
        images: JSON.stringify(imageIds)
      };
  
      const record = await this.pb.collection('products').create(data);
      return record;
    } catch (error) {
      console.error('Error creating product with images:', error);
      throw error;
    }
  }
  
  async getProducts() {
    try {
      return await this.pb.collection('products').getFullList({
        sort: '-created',
        expand: 'category,subcategory' // Asegúrate de que estos sean los nombres correctos de las relaciones
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  async listProducts() {
    try {
      const products = await this.pb.collection(this.collection).getFullList();
      return products;
    } catch (error) {
      console.error('Error listing products:', error);
      throw error;
    }
  }

  async updateProduct(id: string, productData: any) {
    try {
      const data = {
        name: productData.name,
        description: productData.description,
        price: Number(productData.price),
        stock: Number(productData.stock),
        presentation: productData.presentation,
        color: productData.color,
        format: productData.format,
        brand: productData.brand,
        proveedor: productData.proveedor,
        size: productData.size ? JSON.stringify(productData.size) : null,
        expiration_date: productData.expiration_date || null,
        active: true
      };

      const record = await this.pb.collection(this.collection).update(id, data);
      return record;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }


  async deleteProduct(id: string) {
    try {
      const record = await this.pb.collection(this.collection).delete(id);
      return record;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

}
