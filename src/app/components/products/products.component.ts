import { Component, OnInit } from '@angular/core';
import { Product, CreateProductDTO, UpdateProductDTO
 } from 'src/app/models/product.model';

 import { StoreService } from 'src/app/services/store.service';

 import { ProductsService } from 'src/app/services/products.service';

 import { IndicadoresService } from 'src/app/services/indicadores.service';

 import { switchMap, zip } from 'rxjs';

 import Swal from 'sweetalert2';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {

  total = 0;
  myShoppingCart: Product[] = [];
  products:Product[] = [];

  showProductDetail = false;

  productChosen: Product = {
    id: '',
    price: 0,
    images: [],
    title: '',
    category: {
      id: '',
      name: '',
    },
    description: ''
  }

  limit = 10;
  offset = 0;
  statusDetail: 'loading' | 'success' | 'error' | 'init' = 'init';

  constructor(
    private storeService: StoreService,
    private productsService: ProductsService,

    private indicadoresService: IndicadoresService
  ) { 
    this.myShoppingCart = this.storeService.getShoppingCart();
  }

  ngOnInit(): void {
    this.productsService.getProductsByPage(10, 0)
    .subscribe(data =>{
      this.products = data;
      this.offset += this.limit;
    });
  }

  onAddtoShoppingCart(product: Product){

    this.storeService.addProduct(product);
    this.total = this.storeService.getTotal();
  }

  toggleProductDetail(){
    this.showProductDetail = !this.showProductDetail;
  }

  onShowDetail(id: string){
    this.statusDetail='loading';
    this.toggleProductDetail();
    this.productsService.getProduct(id)
    .subscribe(data => {
      // console.log('product',data);
      this.productChosen = data;
      this.statusDetail= 'success';
    }, errorMsg => {
      this.statusDetail = 'error';
      Swal.fire({
        title: "Error",
        text: errorMsg,
        icon: 'error',
        confirmButtonText: 'Cerrar'
      })
    })
  }

  readAndUpdate(id: string){
    this.productsService.getProduct(id)
    .pipe(
      switchMap((product) => this.productsService.update(product.id, {title: 'change'}))
    )
    .subscribe(data => {
      console.log(data)
    });
    this.productsService.fetchReadAndUpdate(id, {title: 'change'})
    .subscribe(response => {
      const read = response[0];
      const update = response[1];
    })
  }

  createNewProduct(){
    const product: CreateProductDTO = {
      title: 'Nuevo producto',
      description: 'descripcion de ejemplo',
      images: ['https://placeimg.com/640/480/any?random=${Math.random()}'],
      price: 1000,
      categoryId: 2,
    }
    this.productsService.create(product)
    .subscribe(data =>{
      this.products.unshift(data)
    })
  }


  updateProduct(){
    const changes: UpdateProductDTO = {
      title: 'change title',
    }
    const id = this.productChosen.id;
    this.productsService.update(id, changes)
    .subscribe(data => {
      const productIndex = this.products.findIndex(item => item.id === this.productChosen.id)
      this.products[productIndex] = data;
    })
  }

  deleteProduct(){
    const id = this.productChosen.id;
    this.productsService.delete(id)
    .subscribe(() =>{
      const productIndex = this.products.findIndex(item => item.id === this.productChosen.id);
      this.products.splice(productIndex,1);
      this.showProductDetail = false;
    });
  }

  loadMore(){
    this.productsService.getProductsByPage(this.limit, this.offset)
    .subscribe(data =>{
      this.products = this.products.concat(data);
      this.offset += this.limit;
    });
  }

}
