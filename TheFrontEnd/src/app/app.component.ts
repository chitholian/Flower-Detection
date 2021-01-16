import {Component, ElementRef, Pipe, PipeTransform, ViewChild} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {DomSanitizer} from '@angular/platform-browser';

@Pipe({name: 'safeHtml'})
export class Safe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {
  }

  transform(html) {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}

class MyData {
  locations = [];
  categories = [];
  scores = [];
  detections = 0;
  similarImages = [];
  taxanomy = [];
  benefits = [];
  queryType = '';
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.styl'],
})
export class AppComponent {
  constructor(private httpClient: HttpClient) {
  }

  @ViewChild('theCanvas', {static: false}) theCanvas: ElementRef;

  categoryNames = [
    'Garden Cosmos',
    'China Rose (Hawaiian Hibiscus)',
    'Merigold',
    'Nootka Rose',
    'Rose',
    'Sun Flower'
  ];

  categoryColors = [
    '#0000ff',
    '#a52a2a',
    '#008b8b',
    '#9932cc',
    '#ff00ff',
    '#008000',
    '#800080',
    '#ff0000',
  ];

  result = {
    error: null,
    data: new MyData(),
    inProgress: false,
    hasError: false,
    hasDetection: false,
  };

  title = 'Flower Detection';
  model = new MyForm();
  imgSrc = '/assets/no-img.jpg';


  showDetections() {
    const img = new Image();
    img.onload = () => {
      const element = this.theCanvas.nativeElement;
      const w = img.width;
      const h = img.height;
      element.width = w;
      element.height = h;
      const ctx = element.getContext('2d');
      const lw = w / 250 + 1;
      ctx.lineWidth = lw;
      const fs = lw * 8;
      ctx.font = fs + 'px arial';
      ctx.textBaseline = 'top';
      ctx.drawImage(img, 0, 0, w, h);
      // Draw rectangles.
      for (const [i, loc] of this.result.data.locations.entries()) {
        const xMin = loc[1] * w;
        const yMin = loc[0] * h;
        const xMax = loc[3] * w;
        const yMax = loc[2] * h;
        // console.log(xMin, yMin, xMax, yMax);
        const cat = this.result.data.categories[i];
        ctx.strokeStyle = this.categoryColors[cat % 6];
        ctx.strokeRect(xMin, yMin, (xMax - xMin), (yMax - yMin));

        const txt = (this.result.data.scores[i] * 100).toFixed(0) + '%';
        /// get width of text
        const tw = ctx.measureText(txt).width;
        /// BG Color
        ctx.fillStyle = 'rgba(255,255,255,0.75)';
        /// draw background rect assuming height of font
        ctx.fillRect(xMin, yMin, tw, fs);
        /// text color
        ctx.fillStyle = this.categoryColors[cat % 6];
        /// draw text on top
        ctx.fillText(txt, xMin, yMin);
      }
    };
    img.src = this.imgSrc;
  }

  submitForm() {
    const form = new FormData();
    form.append('searchType', this.model.searchType);
    if (this.model.searchType === 'keywords') {
      form.append('keywords', this.model.keywords);
    } else if (this.model.searchType === 'image') {
      form.append('image', this.model.imageFile, this.model.imageFile.name);
    }

    const headers = new HttpHeaders();
    headers.append('Content-Type', 'multipart/form-data');
    headers.append('enctype', 'multipart/form-data');
    headers.append('Accept', 'application/json');
    const options = {headers};

    this.result.inProgress = true;
    setTimeout(() =>
      // this.httpClient.get('http://127.0.0.1:8000/api/search/')
      this.httpClient.post<MyData>('http://127.0.0.1:8000/api/search/', form, options)
        .subscribe(
          data => {
            this.result.inProgress = false;
            this.result.hasError = false;
            this.result.data = data;
            this.result.error = null;
            this.result.hasDetection = true;
            console.log(this.result.data);
            if (this.result.data.queryType === 'image') {
              this.showDetections();
            }
          },
          error => {
            this.result.hasError = error;
            this.result.inProgress = false;
            this.result.hasDetection = false;
            this.result.error = 'Request failed !';
            console.log(error.message);
          },
        ), 500);
  }

  onFileChanged(event) {
    const reader = new FileReader();
    if (event.target.files && event.target.files.length) {
      const [file] = event.target.files;
      this.model.imageFile = file;
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.imgSrc = reader.result as string;
      };
    } else {
      this.imgSrc = '/assets/no-img.jpg';
    }
  }

  detectedCategories() {
    return new Set(this.result.data.categories);
  }

  openFullImage(category, img: string) {
    window.open('/api/images/' + category + '/' + img, '_blank');
  }
}

export class MyForm {
  searchType = 'image';
  keywords = '';
  imageFile = null;
}
