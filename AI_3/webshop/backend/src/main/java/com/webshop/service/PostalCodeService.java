package com.webshop.service;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.*;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
public class PostalCodeService {

    private static final Logger log = LoggerFactory.getLogger(PostalCodeService.class);

    private final Map<String, String> postalCodeToCity = new HashMap<>();
    private final Map<String, String> postalCodeToMunicipality = new HashMap<>();

    @PostConstruct
    public void init() {
        loadPostalCodes();
    }

    private void loadPostalCodes() {
        // Try to download from Bring/Posten
        try {
            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://www.bring.no/postnummerregister-ansi.txt"))
                    .GET()
                    .build();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.ISO_8859_1));

            if (response.statusCode() == 200) {
                parsePostalData(response.body());
                log.info("Loaded {} postal codes from Bring", postalCodeToCity.size());
                return;
            }
        } catch (Exception e) {
            log.warn("Could not download postal codes from Bring: {}", e.getMessage());
        }

        // Fallback: load built-in data for common Norwegian postal codes
        loadFallbackPostalCodes();
        log.info("Loaded {} fallback postal codes", postalCodeToCity.size());
    }

    private void parsePostalData(String data) {
        String[] lines = data.split("\n");
        for (String line : lines) {
            String[] parts = line.split("\t");
            if (parts.length >= 4) {
                String code = parts[0].trim();
                String city = parts[1].trim();
                String municipality = parts[3].trim();
                postalCodeToCity.put(code, city);
                postalCodeToMunicipality.put(code, municipality);
            }
        }
    }

    private void loadFallbackPostalCodes() {
        // Major Norwegian cities and areas
        String[][] codes = {
            {"0001", "OSLO", "OSLO"}, {"0010", "OSLO", "OSLO"}, {"0150", "OSLO", "OSLO"},
            {"0250", "OSLO", "OSLO"}, {"0350", "OSLO", "OSLO"}, {"0450", "OSLO", "OSLO"},
            {"0550", "OSLO", "OSLO"}, {"0650", "OSLO", "OSLO"}, {"0750", "OSLO", "OSLO"},
            {"0850", "OSLO", "OSLO"}, {"0950", "OSLO", "OSLO"},
            {"1001", "OSLO", "OSLO"}, {"1050", "OSLO", "OSLO"},
            {"2000", "LILLESTRØM", "LILLESTRØM"}, {"2010", "STRØMMEN", "LILLESTRØM"},
            {"3000", "DRAMMEN", "DRAMMEN"}, {"3100", "TØNSBERG", "TØNSBERG"},
            {"3200", "SANDEFJORD", "SANDEFJORD"}, {"3400", "LIER", "LIER"},
            {"3500", "HØNEFOSS", "RINGERIKE"}, {"3600", "KONGSBERG", "KONGSBERG"},
            {"3700", "SKIEN", "SKIEN"}, {"3800", "BØ I TELEMARK", "MIDT-TELEMARK"},
            {"3900", "PORSGRUNN", "PORSGRUNN"},
            {"4000", "STAVANGER", "STAVANGER"}, {"4010", "STAVANGER", "STAVANGER"},
            {"4020", "STAVANGER", "STAVANGER"}, {"4030", "STAVANGER", "STAVANGER"},
            {"4050", "SOLA", "SOLA"}, {"4056", "TANANGER", "SOLA"},
            {"4070", "RANDABERG", "RANDABERG"}, {"4085", "HUNDVÅG", "STAVANGER"},
            {"4100", "JØRPELAND", "STRAND"}, {"4200", "SAUDA", "SAUDA"},
            {"4300", "SANDNES", "SANDNES"}, {"4310", "HOMMERSÅK", "SANDNES"},
            {"4320", "SANDNES", "SANDNES"}, {"4330", "ÅLGÅRD", "GJESDAL"},
            {"4340", "BRYNE", "TIME"}, {"4350", "KLEPPE", "KLEPP"},
            {"4360", "VARHAUG", "HÅ"}, {"4370", "EGERSUND", "EIGERSUND"},
            {"4380", "HAUGE I DALANE", "EIGERSUND"},
            {"4400", "FLEKKEFJORD", "FLEKKEFJORD"},
            {"4500", "MANDAL", "LINDESNES"}, {"4600", "KRISTIANSAND", "KRISTIANSAND"},
            {"4610", "KRISTIANSAND", "KRISTIANSAND"}, {"4620", "KRISTIANSAND", "KRISTIANSAND"},
            {"4630", "KRISTIANSAND", "KRISTIANSAND"},
            {"4700", "VENNESLA", "VENNESLA"}, {"4800", "ARENDAL", "ARENDAL"},
            {"4900", "TVEDESTRAND", "TVEDESTRAND"},
            {"5000", "BERGEN", "BERGEN"}, {"5003", "BERGEN", "BERGEN"},
            {"5005", "BERGEN", "BERGEN"}, {"5010", "BERGEN", "BERGEN"},
            {"5020", "BERGEN", "BERGEN"}, {"5050", "NESTTUN", "BERGEN"},
            {"5100", "ISDALSTØ", "ALVER"}, {"5200", "OS", "BJØRNAFJORDEN"},
            {"5300", "KLEPPESTØ", "ASKØY"}, {"5500", "HAUGESUND", "HAUGESUND"},
            {"5600", "NORHEIMSUND", "KVAM"},
            {"6000", "ÅLESUND", "ÅLESUND"}, {"6003", "ÅLESUND", "ÅLESUND"},
            {"6100", "VOLDA", "VOLDA"}, {"6200", "STRANDA", "STRANDA"},
            {"6400", "MOLDE", "MOLDE"}, {"6500", "KRISTIANSUND", "KRISTIANSUND"},
            {"6600", "SUNNDALSØRA", "SUNNDAL"}, {"6700", "MÅLØY", "KINN"},
            {"6800", "FØRDE", "SUNNFJORD"}, {"6900", "FLORØ", "KINN"},
            {"7000", "TRONDHEIM", "TRONDHEIM"}, {"7010", "TRONDHEIM", "TRONDHEIM"},
            {"7020", "TRONDHEIM", "TRONDHEIM"}, {"7030", "TRONDHEIM", "TRONDHEIM"},
            {"7040", "TRONDHEIM", "TRONDHEIM"}, {"7050", "TRONDHEIM", "TRONDHEIM"},
            {"7100", "RISSA", "INDRE FOSEN"}, {"7200", "KYRKSÆTERØRA", "HEIM"},
            {"7300", "ORKANGER", "ORKLAND"}, {"7400", "TRONDHEIM", "TRONDHEIM"},
            {"7500", "STJØRDAL", "STJØRDAL"}, {"7600", "LEVANGER", "LEVANGER"},
            {"7700", "STEINKJER", "STEINKJER"}, {"7800", "NAMSOS", "NAMSOS"},
            {"7900", "RØRVIK", "NÆRØYSUND"},
            {"8000", "BODØ", "BODØ"}, {"8100", "MISVÆR", "BODØ"},
            {"8200", "FAUSKE", "FAUSKE"}, {"8300", "SVOLVÆR", "VÅGAN"},
            {"8400", "SORTLAND", "SORTLAND"}, {"8500", "NARVIK", "NARVIK"},
            {"8600", "MO I RANA", "RANA"}, {"8700", "NESNA", "NESNA"},
            {"8800", "SANDNESSJØEN", "ALSTAHAUG"}, {"8900", "BRØNNØYSUND", "BRØNNØY"},
            {"9000", "TROMSØ", "TROMSØ"}, {"9008", "TROMSØ", "TROMSØ"},
            {"9100", "KVALØYSLETTA", "TROMSØ"}, {"9170", "LONGYEARBYEN", "LONGYEARBYEN"},
            {"9200", "BARDUFOSS", "MÅLSELV"}, {"9300", "FINNSNES", "SENJA"},
            {"9400", "HARSTAD", "HARSTAD"}, {"9500", "ALTA", "ALTA"},
            {"9600", "HAMMERFEST", "HAMMERFEST"}, {"9700", "LAKSELV", "PORSANGER"},
            {"9800", "VADSØ", "VADSØ"}, {"9900", "KIRKENES", "SØR-VARANGER"},
            {"9950", "VARDØ", "VARDØ"}, {"9990", "BÅTSFJORD", "BÅTSFJORD"},
        };

        for (String[] c : codes) {
            postalCodeToCity.put(c[0], c[1]);
            postalCodeToMunicipality.put(c[0], c[2]);
        }
    }

    public String lookupCity(String postalCode) {
        return postalCodeToCity.getOrDefault(postalCode, null);
    }

    /**
     * Calculate shipping cost based on postal code zone.
     * Zone 1: Oslo/Akershus (0xxx-1xxx) — 49 kr
     * Zone 2: South/East Norway (2xxx-4xxx) — 79 kr
     * Zone 3: West Norway (5xxx-6xxx) — 99 kr
     * Zone 4: Central Norway (7xxx) — 99 kr
     * Zone 5: North Norway (8xxx-9xxx) — 149 kr
     */
    public BigDecimal calculateShipping(String postalCode) {
        if (postalCode == null || postalCode.length() != 4) {
            return new BigDecimal("99");
        }

        char firstDigit = postalCode.charAt(0);
        return switch (firstDigit) {
            case '0', '1' -> new BigDecimal("49");
            case '2', '3' -> new BigDecimal("79");
            case '4' -> new BigDecimal("79");
            case '5', '6' -> new BigDecimal("99");
            case '7' -> new BigDecimal("99");
            case '8', '9' -> new BigDecimal("149");
            default -> new BigDecimal("99");
        };
    }

    public boolean isValidPostalCode(String postalCode) {
        return postalCode != null && postalCode.matches("\\d{4}");
    }
}
