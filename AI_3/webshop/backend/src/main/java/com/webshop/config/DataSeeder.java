package com.webshop.config;

import com.webshop.model.Product;
import com.webshop.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private final ProductRepository productRepository;

    public DataSeeder(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    public void run(String... args) {
        if (productRepository.count() > 0) return;

        List<Product> products = List.of(
            new Product("Fjelljakke Nordvind", "Premium vindtett jakke for norske fjell. Pustende Gore-Tex materiale.", new BigDecimal("1299.00"), 25, "Klær", "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop"),
            new Product("Ullgenser Marius", "Klassisk norsk mønsterstrikk i 100% merinoull. Varm og tidløs.", new BigDecimal("899.00"), 40, "Klær", "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=400&h=400&fit=crop"),
            new Product("Turbukse Vidda", "Slitesterk turbukse med forsterket kne. Perfekt for tur i all slags vær.", new BigDecimal("699.00"), 30, "Klær", "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=400&fit=crop"),
            new Product("Fjellstøvler Jotunheim", "Vanntette støvler med Vibram-såle. Ankelhøye for god støtte.", new BigDecimal("1599.00"), 15, "Sko", "https://images.unsplash.com/photo-1542840410-3092f99611a3?w=400&h=400&fit=crop"),
            new Product("Sandaler Sommer", "Lette og komfortable sandaler for sommerdager.", new BigDecimal("449.00"), 50, "Sko", "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=400&h=400&fit=crop"),
            new Product("Tursekk Rondane 45L", "Ergonomisk tursekk med justerbart bæresystem. 45 liter.", new BigDecimal("999.00"), 20, "Utstyr", "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop"),
            new Product("Sovepose Nordlys -15°C", "Dunpose for kalde vintermetter. Komforttemp ned til -15°C.", new BigDecimal("2499.00"), 8, "Utstyr", "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&h=400&fit=crop"),
            new Product("Hodelykkt Polar 500", "Kraftig hodelykkt med 500 lumen. USB-C lading.", new BigDecimal("349.00"), 60, "Utstyr", "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400&h=400&fit=crop"),
            new Product("Termos Fjord 1L", "Vakuumisolert termos i rustfritt stål. Holder varmt i 24 timer.", new BigDecimal("299.00"), 45, "Utstyr", "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop"),
            new Product("Telt Lofoten 2", "Lettvekts 2-persons telt. 3-sesonger. Kun 1.8 kg.", new BigDecimal("3499.00"), 5, "Utstyr", "https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=400&h=400&fit=crop"),
            new Product("Kompass Expedition", "Presisionskompass med speil og klinometer. Militærstandard.", new BigDecimal("199.00"), 35, "Utstyr", "https://images.unsplash.com/photo-1504700610630-ac6eeec48b24?w=400&h=400&fit=crop"),
            new Product("Gamasjer Hardanger", "Vanntette gamasjer for snødekte stier. Justerbar passform.", new BigDecimal("249.00"), 3, "Klær", "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=400&h=400&fit=crop"),
            new Product("Sitteunderlag Foam", "Isolerende sitteunderlag. Lett og kompakt. Uunnværlig på tur.", new BigDecimal("79.00"), 100, "Utstyr", "https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?w=400&h=400&fit=crop"),
            new Product("Turkokekar Storm", "Kompakt kokekar-sett med gassbrenner. Vindskjerm inkludert.", new BigDecimal("599.00"), 18, "Utstyr", "https://images.unsplash.com/photo-1510672981848-a1c4f1cb5ccf?w=400&h=400&fit=crop"),
            new Product("Softshell Breeze", "Lett softshell-jakke for aktive dager. Stretch og vindtett.", new BigDecimal("549.00"), 22, "Klær", "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=400&fit=crop"),
            new Product("Tursokker Merino 3-pk", "Sett med 3 par merinoull-sokker. Fukttransporterende.", new BigDecimal("249.00"), 70, "Klær", "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=400&h=400&fit=crop")
        );

        productRepository.saveAll(products);
    }
}
