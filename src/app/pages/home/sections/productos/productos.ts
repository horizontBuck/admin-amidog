import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';   
import { ProductsService } from '../../../../services/products.service';
import { CategoriesService } from '../../../../services/categories.service';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productos.html',
  styleUrl: './productos.scss'
})
export class Productos {
  products: any[] = [];  
  categories: any[] = [];
  filteredSubcategories: any[] = [];
  selectedImages: File[] = [];
  imagePreviews: string[] = [];

  // Modelo para el formulario

  product = {
    name: '',
    description: '',
    price: 0,
    stock: 0,
    presentation: '',
    color: '',
    format: '',
    brand: '',
    proveedor: '',
    size: '',
    expiration_date: '',
    category: '',
    subcategory: '',
    active: true,
    image: '',
    images: []
  };

  loading = false;


  constructor(
    public productsService: ProductsService,
    public categoriesService: CategoriesService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.listProducts();
    this.listCategories();
  }

  async listProducts() {
    try {
      const products = await this.productsService.listProducts();
      this.products = products;
    } catch (error) {
      console.error('Error al listar productos:', error);
    }
  }

  async listCategories() {
    try {
      const categories = await this.categoriesService.getCategories();
      this.categories = categories;
    } catch (error) {
      console.error('Error al listar categorías:', error);
    }
  }

  onCategoryChange(categoryId: string) {
    // Encontrar la categoría seleccionada
    const selectedCategory = this.categories.find(cat => cat.id === categoryId);
    
    // Obtener las subcategorías de la categoría seleccionada
    this.filteredSubcategories = selectedCategory?.subs || [];
    
    // Resetear la subcategoría seleccionada
    this.product.subcategory = '';
  }

 /*  onImageSelected(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.match('image.*')) {
          this.selectedImages.push(file);
          
          // Create preview
          const reader = new FileReader();
          reader.onload = (e: any) => {
            this.imagePreviews.push(e.target.result);
          };
          reader.readAsDataURL(file);
        }
      }
    }
  } */
  onImageSelected(event: any) {
    const files = event.target.files;
    if (!files || files.length === 0) return;
  
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validar tipo de archivo
      if (!file.type.match('image.*')) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `El archivo ${file.name} no es una imagen válida`,
          timer: 3000
        });
        continue;
      }
  
      // Validar tamaño (ejemplo: máximo 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `La imagen ${file.name} es demasiado grande (máx. 5MB)`,
          timer: 3000
        });
        continue;
      }
  
      this.selectedImages.push(file);
      
      // Crear vista previa
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreviews.push(e.target.result);
        this.cdr.detectChanges(); // Necesario para actualizar la vista
      };
      reader.readAsDataURL(file);
    }
  
    // Limpiar el input para permitir seleccionar el mismo archivo otra vez
    event.target.value = '';
  }

  removeImage(index: number) {
    this.selectedImages.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }

  async onSubmit() {
    if (this.loading) return;
    
    this.loading = true;
    
    try {
  
      // Crear el objeto del producto
      const productData = {
        ...this.product,
        // Asegurarse de que los campos numéricos sean números
        price: Number(this.product.price),
        stock: Number(this.product.stock),
        // Añadir la categoría y subcategoría
        category: this.product.category,
        subcategory: this.product.subcategory
        };
        console.log('Product data to be sent:', productData);


        await this.productsService.createProduct(productData, this.selectedImages);


      await Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: 'Producto creado correctamente',
        timer: 2000,
        showConfirmButton: false
      });
      
      this.resetForm();
      await this.listProducts();
      
    } catch (error) {
      console.error('Error:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al crear el producto',
        timer: 2000,
        showConfirmButton: false
      });
    } finally {
      this.loading = false;
    }
  }

  private resetForm() {
    this.product = {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      presentation: '',
      color: '',
      format: '',
      brand: '',
      proveedor: '',
      size: '',
      expiration_date: '',
      category: '',
      subcategory: '',
      active: true,
      image: '',
      images: []
    };
    this.selectedImages = [];
    this.imagePreviews = [];
    this.filteredSubcategories = [];
  }


}
